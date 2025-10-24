variable "region" {
  description = "AWS Region"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "profile" {
  description = "The AWS CLI profile to use for terraform"
  type        = string
  default     = "default"
}

variable "allowed_domain" {
  description = "Email domain allowed to login"
  type        = string
  default     = "svatba2026.com"
}

variable "callback_url" {
  description = "URL to redirect the customer to after successful login"
  type        = string
  default     = "https://svatba2026.com/auth/callback"
}

variable "logout_url" {
  description = "URL to redirect the customer after logout"
  type        = string
  default     = "https://svatba2026.com/auth/logout"
}

# OAuth Providers
variable "google_client_id" {
  description = "Client ID of the google auth service"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "facebook_client_id" {
  description = "Facebook App ID"
  type        = string
}

variable "facebook_client_secret" {
  description = "Facebook App Secret"
  type        = string
  sensitive   = true
}

variable "webhook_url" {
  description = "Webhook URL for the lambda to POST once its done processing images."
  type        = string
}

variable "webhook_secret" {
  description = "The secret for the webhook. It will be attached as a Authorization: Bearer token by the lambda."
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "List of allowed origins for S3 CORS"
  type        = list(string)
  default     = []
}
