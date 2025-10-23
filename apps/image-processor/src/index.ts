import type { S3Event, S3EventRecord } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "stream";
import {
  decodeS3Key,
  generateProcessedKey,
  shouldSkipProcessing,
  streamToBuffer,
} from "./utils";
import CONFIG from "./config";
import {
  ProcessedImageMap,
  ProcessingResult,
  SIZES,
  WebhookPayload,
} from "./types";

function validateEnvironment(): void {
  const required = ["BUCKET_NAME", "WEBHOOK_URL", "WEBHOOK_SECRET"];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

validateEnvironment();

const s3Client = new S3Client({ region: CONFIG.region });

async function fetchImageFromS3(bucket: string, key: string): Promise<Buffer> {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  if (!response.Body) {
    throw new Error(`No image data received from S3 for key: ${key}`);
  }

  return streamToBuffer(response.Body as Readable);
}

async function processImageSize(
  imageBuffer: Buffer,
  config: { width: number; quality: number }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const pipeline = sharp(imageBuffer)
    .resize(config.width, null, { withoutEnlargement: true })
    .webp({ quality: config.quality });

  const [buffer, metadata] = await Promise.all([
    pipeline.toBuffer(),
    pipeline.metadata(),
  ]);

  return {
    buffer,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

async function uploadProcessedImage(
  bucket: string,
  key: string,
  buffer: Buffer
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

async function processAllSizes(
  imageBuffer: Buffer,
  bucket: string,
  originalKey: string
): Promise<ProcessedImageMap> {
  const processedImages = {} as ProcessedImageMap;

  await Promise.all(
    Object.entries(SIZES).map(async ([sizeName, config]) => {
      const { buffer, width, height } = await processImageSize(
        imageBuffer,
        config
      );

      const processedKey = generateProcessedKey(sizeName, originalKey);
      await uploadProcessedImage(bucket, processedKey, buffer);

      processedImages[sizeName as keyof typeof SIZES] = {
        key: processedKey,
        size: buffer.length,
        width,
        height,
      };
    })
  );

  return processedImages;
}

async function sendWebhook(result: ProcessingResult): Promise<void> {
  const payload: WebhookPayload = {
    data: result,
    createdAt: Math.floor(Date.now() / 1000),
  };

  const response = await fetch(CONFIG.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.webhookSecret}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Webhook failed with status ${response.status}: ${await response.text()}`
    );
  }
}

function extractS3Info(record: S3EventRecord): { bucket: string; key: string } {
  return {
    bucket: record.s3.bucket.name,
    key: decodeS3Key(record.s3.object.key),
  };
}

export const handler = async (event: S3Event): Promise<ProcessingResult> => {
  const record = event.Records[0];
  const { bucket, key } = extractS3Info(record);

  console.log(`Processing image: ${key} from bucket: ${bucket}`);

  if (shouldSkipProcessing(key)) {
    console.log("Skipping already processed image:", key);
    throw new Error("Image already processed", { cause: event });
  }

  try {
    const imageBuffer = await fetchImageFromS3(bucket, key);
    const uploadedAt = Date.now();

    const processedImages = await processAllSizes(imageBuffer, bucket, key);

    const result: ProcessingResult = {
      originalKey: key,
      processedImages,
      uploadedAt,
    };

    await sendWebhook(result);

    console.log(`Successfully processed image: ${key}`);
    return result;
  } catch (error) {
    console.error(`Error processing image ${key}:`, error);
    throw error;
  }
};
