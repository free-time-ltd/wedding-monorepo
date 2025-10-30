# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name                     = "wedding-user-pool-${var.environment}"
  mfa_configuration        = "OPTIONAL"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  software_token_mfa_configuration {
    enabled = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }

    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_uppercase = false
    require_numbers   = false
    require_symbols   = false
  }

  tags = {
    Application = "wedding-app"
  }
}

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "openid email profile"
  }

  attribute_mapping = {
    username       = "sub"
    email          = "email"
    email_verified = "email_verified"
    family_name    = "family_name"
    given_name     = "given_name"
    birthdate      = "birthdays"
  }
}

resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    client_id        = var.facebook_client_id
    client_secret    = var.facebook_client_secret
    authorize_scopes = "email public_profile"
  }

  attribute_mapping = {
    email       = "email"
    username    = "id"
    family_name = "last_name"
    given_name  = "first_name"
    gender      = "gender"
    locale      = "locale"
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "wedding-app-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "aws_cognito_user_pool_client" "app_client" {
  name         = "wedding-app-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id


  allowed_oauth_flows_user_pool_client = true
  generate_secret                      = false
  supported_identity_providers         = ["COGNITO", aws_cognito_identity_provider.google.provider_name, aws_cognito_identity_provider.facebook.provider_name]
  allowed_oauth_flows                  = ["implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = var.callback_url
  logout_urls                          = var.logout_url
}

resource "aws_cognito_user_group" "admin_group" {
  user_pool_id = aws_cognito_user_pool.main.id
  name         = "admin"
  description  = "Administrators group"
}
