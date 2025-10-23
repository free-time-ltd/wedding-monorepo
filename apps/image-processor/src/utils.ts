import { Readable } from "stream";
import CONFIG from "./config";

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

export function decodeS3Key(key: string): string {
  return decodeURIComponent(key.replace(/\+/g, " "));
}

export function shouldSkipProcessing(key: string): boolean {
  return key.startsWith(CONFIG.processedPrefix);
}

export function generateProcessedKey(
  sizeName: string,
  originalKey: string
): string {
  return `${CONFIG.processedPrefix}${sizeName}/${originalKey}.webp`;
}
