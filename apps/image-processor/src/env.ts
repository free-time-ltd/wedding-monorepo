import { z } from "zod";

const envSchema = z.object({
  AWS_REGION: z.string().default("eu-west-2"),
  BUCKET_NAME: z.string(),
  WEBHOOK_URL: z.url(),
  WEBHOOK_SECRET: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
