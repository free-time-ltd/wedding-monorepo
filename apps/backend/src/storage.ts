import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateId } from "@repo/utils/generateId";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export const generatePresignedUploadUrl = () => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${generateId()}`,
    ContentType: "image/jpeg",
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
};

export default s3;
