const CONFIG = {
  region: process.env.AWS_REGION || "eu-west-2",
  bucketName: process.env.BUCKET_NAME!,
  webhookUrl: process.env.WEBHOOK_URL!,
  webhookSecret: process.env.WEBHOOK_SECRET!,
  processedPrefix: "processed/",
} as const;

export default CONFIG;
