terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  required_version = ">=1.5.0"

  backend "s3" {
    bucket  = "tf-state-krisi"
    key     = "wedding/live/terraform.tfstate"
    region  = "eu-west-2"
    profile = "krisi"
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

# Create an application that would track all the resources
resource "aws_resourcegroups_group" "wedding-app" {
  name = "wedding-app-${var.environment}"
  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [{
        Key    = "Application"
        Values = ["wedding-app"]
      }]
    })
    type = "TAG_FILTERS_1_0"
  }
}
