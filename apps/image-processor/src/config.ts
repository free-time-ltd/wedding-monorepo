import { env } from "./env";

const CONFIG = {
  region: env.AWS_REGION || "eu-west-2",
  bucketName: env.BUCKET_NAME,
  webhookUrl: env.WEBHOOK_URL,
  webhookSecret: env.WEBHOOK_SECRET,
  processedPrefix: "processed/",
} as const;

export default CONFIG;
