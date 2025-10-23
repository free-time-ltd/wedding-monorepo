export const SIZES = {
  full: { width: 1920, quality: 85 },
  medium: { width: 1024, quality: 80 },
  thumbnail: { width: 300, quality: 75 },
} as const;

export interface ProcessedImage {
  key: string;
  size: number;
  width: number;
  height: number;
}

export type ProcessedImageMap = Record<keyof typeof SIZES, ProcessedImage>;

export interface ProcessingResult {
  originalKey: string;
  processedImages: ProcessedImageMap;
  uploadedAt: number;
}

export interface WebhookPayload {
  data: ProcessingResult;
  createdAt: number;
}
