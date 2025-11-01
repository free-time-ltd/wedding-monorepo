import { menuTypes, transportTypes } from "@repo/db/schema";
import type { Context } from "hono";
import z from "zod";
import { AuthVariables } from "./middleware";

export const imageUploadSchema = z.object({
  filename: z.string(),
  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
  sizeBytes: z.number(),
  width: z.number(),
  height: z.number(),
  message: z.string().optional(),
});

export const rsvpSchema = z.object({
  menuChoice: z.enum(menuTypes),
  attending: z.boolean(),
  plusOne: z.boolean(),
  accommodation: z.boolean(),
  transportation: z.enum(transportTypes),
  notes: z.string().optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export type SimpleAuthContext = Context<{ Variables: AuthVariables }>;

export const newsletterSignSchema = z.object({
  email: z.email(),
});

export type NewsletterSignInput = z.infer<typeof newsletterSignSchema>;
