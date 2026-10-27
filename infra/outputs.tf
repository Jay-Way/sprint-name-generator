output "api_url" {
  description = "Paste into REGISTRY_API in index.html, without the trailing slash."
  value       = trimsuffix(aws_lambda_function_url.fn.function_url, "/")
}
