resource "aws_lambda_layer_version" "sharp" {
  filename            = "../apps/image-processor/layer/sharp-layer.zip"
  layer_name          = "sharp-layer-${var.environment}"
  description         = "Sharp image processing library for Node.js"
  compatible_runtimes = ["nodejs20.x"]

  source_code_hash = filebase64sha256("../apps/image-processor/layer/sharp-layer.zip")
}

resource "aws_lambda_function" "image_processor" {
  filename         = "../apps/image-processor/lambda.zip"
  function_name    = "image-processor-${var.environment}"
  role             = aws_iam_role.lambda_s3_role.arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("../apps/image-processor/lambda.zip")
  runtime          = "nodejs20.x"

  layers = [aws_lambda_layer_version.sharp.arn]

  depends_on = [aws_lambda_layer_version.sharp]

  timeout     = 30
  memory_size = 1024

  environment {
    variables = {
      BUCKET_NAME    = aws_s3_bucket.uploads.id
      WEBHOOK_URL    = var.webhook_url
      WEBHOOK_SECRET = var.webhook_secret
    }
  }

  tags = {
    Name        = "wedding-image-processor-${var.environment}"
    Environment = var.environment
    Application = "wedding-app"
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.image_processor.function_name}"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Application = "wedding-app"
  }
}
