variable "account_id" {
  description = "The site's own AWS account. Terraform refuses to touch any other. Set it in terraform.tfvars (gitignored)."
  type        = string
  validation {
    condition     = can(regex("^[0-9]{12}$", var.account_id))
    error_message = "account_id is the twelve-digit AWS account id."
  }
}

variable "region" {
  description = "Region for the table and the function."
  type        = string
  default     = "eu-central-1"
}

variable "site_origin" {
  description = "The site's origin. CORS is pinned to it, and the function reads /corpus.json from it."
  type        = string
  default     = "https://sprintname.dev"
}

variable "extra_origins" {
  description = "Further origins allowed to call the API, e.g. [\"http://localhost:8000\"] while testing."
  type        = list(string)
  default     = []
}

variable "reserved_concurrency" {
  description = "Hard cap on concurrent executions. null for no cap (required while the account quota is 10)."
  type        = number
  default     = 3
  nullable    = true
}

variable "budget_email" {
  description = "Address for the cost alarm. Empty to skip the budget."
  type        = string
  default     = ""
}

variable "budget_usd" {
  description = "Monthly budget the alarm fires at 80% of. The budget is scoped to the whole account."
  type        = string
  default     = "5"
}
