import { S3Event, Context } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const SIZES = {
  full: { width: 1920, quality: 85 },
  medium: { width: 1024, quality: 80 },
  thumbnail: { width: 300, quality: 75 },
} as const;

interface ProcessedImage {
  key: string;
  size: number;
  width: number;
  height: number;
}

interface ProcessingResult {
  originalKey: string;
  processedImages: {
    full: ProcessedImage;
    medium: ProcessedImage;
    thumbnail: ProcessedImage;
  };
  uploadedAt: number;
}

export const handler = async (event: S3Event, context: Context) => {
  console.log("Processing S3 event:", JSON.stringify(event, null, 2));
};
