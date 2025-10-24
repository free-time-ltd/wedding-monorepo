import z from "zod";

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
