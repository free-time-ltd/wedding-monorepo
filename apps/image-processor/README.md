# Image Processor Lambda

## Build the layer

For this function to work we first need to build the sharp layer and then the function itself.
We need the sharp library on another layer because it provides binaries for the platform it is built on.
That's usually the developer's computer so we need specific build step to bundle the x86 linux binaries.

Currently Windows is not supported, but that's only for the lambda anyways.

```bash
cd apps/image-processor
sh build-layer.sh
```

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
