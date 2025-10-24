import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface PresignedUrlProps {
  id?: string;
  filename: string;
  s3key: string;
  mimeType: string;
}

export const generatePresignedUploadUrl = ({
  id = "unknown",
  filename,
  s3key,
  mimeType,
}: PresignedUrlProps) => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: `uploads/${s3key}`,
    ContentType: mimeType,
    Metadata: {
      databaseKey: id,
      originalFilename: filename,
    },
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
};

export default s3;
