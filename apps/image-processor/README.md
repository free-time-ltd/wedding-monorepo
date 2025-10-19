# Image Processor Lambda

## Build

```bash
npm install
npm run build
```

This creates `lambda.zip` ready for deployment

## Deploy

Upload `lambda.zip` to AWS Lambda via Terraform or AWS CLI

## Environment Variables

- WEBHOOK_URL: Your backend webhook endpoint
- WEBHOOK_SECRET: Shared secret to verify requests
- AWS_REGION: AWS region (optional, defaults to us-east-1)
