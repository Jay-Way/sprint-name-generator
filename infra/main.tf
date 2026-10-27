# ------------------------------------------------------------------
# THE REGISTRY — infrastructure for team registers.
#
# Applied by hand, once, from a laptop holding credentials for the
# account the site lives in. Deliberately not part of the deploy
# workflow: the function reads the corpus from the site at runtime,
# so a new name never needs this applied again. Only a change to
# api/handler.mjs does. See README → Team registers.
#
# Everything here is independent of the S3 bucket and the CloudFront
# distribution, neither of which Terraform manages. The browser talks
# to the function URL directly, cross-origin, with CORS pinned to the
# site.
# ------------------------------------------------------------------

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}

provider "aws" {
  region = var.region
  # The machine that applies this also holds credentials for accounts that
  # have nothing to do with this site. A forgotten or mistyped AWS_PROFILE
  # must fail at plan time, not create a table somewhere it should not be.
  allowed_account_ids = [var.account_id]
  default_tags {
    tags = { Project = "sprint-name-generator" }
  }
}

data "aws_caller_identity" "current" {}

locals {
  name = "sng-registry"
}

# ---------- the file store ----------

resource "aws_dynamodb_table" "registers" {
  name         = "${local.name}-registers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  # Empty files go after 7 days, idle ones after 18 months. The function
  # sets the date; DynamoDB does the shredding.
  ttl {
    attribute_name = "expires"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = false
  }
}

# ---------- the function ----------

data "archive_file" "handler" {
  type        = "zip"
  source_file = "${path.module}/../api/handler.mjs"
  output_path = "${path.module}/.build/handler.zip"
}

# The boundary is created by hand, once, from iam/registry-boundary.json -
# see README → Team registers. Every role this configuration makes must
# carry it, because the deployer is only allowed to create roles that do:
# without that, a role-creating deployer is an administrator with extra
# steps (write any policy, hand it to a function, invoke the function).
resource "aws_iam_role" "fn" {
  name                 = "${local.name}-fn"
  permissions_boundary = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.name}-boundary"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Four item operations on one table, and its own log group. Nothing else.
resource "aws_iam_role_policy" "fn" {
  role = aws_iam_role.fn.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
        Resource = aws_dynamodb_table.registers.arn
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.fn.arn}:*"
      }
    ]
  })
}

# Created here rather than on first invocation, so that retention is set
# from the start. The function logs only its own failures.
resource "aws_cloudwatch_log_group" "fn" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "fn" {
  function_name    = local.name
  role             = aws_iam_role.fn.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "handler.handler"
  filename         = data.archive_file.handler.output_path
  source_code_hash = data.archive_file.handler.output_base64sha256
  memory_size      = 256
  timeout          = 10

  # The cost ceiling. A public endpoint will be hammered by somebody
  # eventually; this caps how much of it runs at once. null removes the
  # cap - needed on accounts whose concurrency quota is still 10, where
  # reserving anything at all is refused.
  reserved_concurrent_executions = var.reserved_concurrency

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.registers.name
      CORPUS_URL = "${var.site_origin}/corpus.json"
    }
  }

  depends_on = [aws_cloudwatch_log_group.fn, aws_iam_role_policy.fn]
}

resource "aws_lambda_function_url" "fn" {
  function_name      = aws_lambda_function.fn.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = concat([var.site_origin], var.extra_origins)
    allow_methods = ["GET", "POST", "DELETE"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 3600
  }
}

# A NONE-auth URL still needs both statements, or every call is a 403.
# The second is scoped to function-URL invocations only, so it does not
# open the function to direct Invoke calls from other accounts.
resource "aws_lambda_permission" "url" {
  statement_id           = "PublicFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.fn.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "invoke_via_url" {
  statement_id             = "InvokeViaFunctionUrl"
  action                   = "lambda:InvokeFunction"
  function_name            = aws_lambda_function.fn.function_name
  principal                = "*"
  invoked_via_function_url = true
}

# ---------- the alarm ----------

resource "aws_budgets_budget" "registry" {
  count        = var.budget_email == "" ? 0 : 1
  name         = "${local.name}-monthly"
  budget_type  = "COST"
  limit_amount = var.budget_usd
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_email]
  }
}
