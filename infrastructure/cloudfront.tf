### CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "wedding-s3-oac-${var.environment}"
  description                       = "OAC for wedding gallery S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

### CloudFront distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Wedding gallery distribution for ${var.environment}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  # Origin for the main S3 bucket
  origin {
    domain_name              = aws_s3_bucket.uploads.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    origin_id                = "S3-wedding-gallery"
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-wedding-gallery"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Cache optimized for images
    cache_policy_id = aws_cloudfront_cache_policy.image_optimized.id
  }

  # Restrict to specific countries if needed
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate - using CloudFront's default certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = var.environment
    Application = "wedding-app"
  }
}

# Optimized cache policy for images
resource "aws_cloudfront_cache_policy" "image_optimized" {
  name        = "wedding-image-optimized-${var.environment}"
  comment     = "Cache policy optimized for wedding gallery images"
  min_ttl     = 0
  default_ttl = 86400    # 24 hours
  max_ttl     = 31536000 # 1 year

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Update S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = aws_s3_bucket.uploads.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipalReadOnly"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.uploads.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.s3_distribution.arn
          }
        }
      }
    ]
  })
}
