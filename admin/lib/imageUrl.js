import { getApiUrl } from "./getApiUrl";

export const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop";

export function resolveImageUrl(image) {
  if (!image || typeof image !== "string" || !image.trim()) {
    return "";
  }
  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/")) {
    return `${getApiUrl()}${trimmed}`;
  }
  return `${getApiUrl()}/uploads/${trimmed}`;
}

export function getUploadFilename(image) {
  if (!image || typeof image !== "string") return null;
  const match = image.match(/\/uploads\/([^/?#]+)/);
  return match ? match[1] : null;
}

export function withFallback(image) {
  return resolveImageUrl(image) || FALLBACK_IMG;
}

export function isUploadedImage(image) {
  return Boolean(getUploadFilename(image));
}

/** Normalize for saving to database */
export function normalizeStoredImage(image) {
  if (!image || typeof image !== "string") return "";
  const trimmed = image.trim();
  if (!trimmed) return "";
  const idx = trimmed.indexOf("/uploads/");
  if (idx !== -1) return trimmed.slice(idx).split("?")[0];
  return trimmed;
}
