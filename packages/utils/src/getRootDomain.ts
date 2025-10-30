export const getRootDomain = (host?: string): string | undefined => {
  if (!host) return undefined;

  try {
    const parts = new URL(`https://${host}`).hostname.split(".");
    return parts.length >= 2 ? parts.slice(-2).join(".") : undefined;
  } catch {
    return undefined;
  }
};
