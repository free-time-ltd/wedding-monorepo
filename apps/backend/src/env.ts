import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  BACKEND_PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string(),
  JWT_SECRET: z.string(),
  DB_PATH: z.string().default("file:./database/dbase.sqlite"),
  SESSION_COOKIE_NAME: z.string(),
  AWS_REGION: z.string().default("eu-west-2"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
  RESEND_KEY: z.string(),
  MAIL_ADDRESS_FROM: z.string().default("no-reply@kristinakostova.com"),
  WEBHOOK_SECRET: z.string(),
  CDN_DOMAIN: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
