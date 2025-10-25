const mimeExtensionMap: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/bmp": "bmp",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
  "image/x-icon": "ico",
};

export default function mimeToExt(mime: string) {
  const mimeType = mime.toLowerCase().trim();

  if (!(mimeType in mimeExtensionMap)) {
    throw new Error(`Unknown mime type: ${mime}`);
  }

  return mimeExtensionMap[mimeType.toLowerCase()] ?? null;
}
