const API_BASE = process.env.API_BASE_URL || "https://palms-grill-backend.onrender.com";

export default API_BASE;
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image || typeof image !== "string" || !image.trim()) {
    return "";
  }
  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }
  return `${API_BASE}/uploads/${trimmed}`;
}

function getUploadFilename(image) {
  if (!image || typeof image !== "string") return null;
  const match = image.match(/\/uploads\/([^/?#]+)/);
  return match ? match[1] : null;
}

function withFallback(image) {
  return resolveImageUrl(image) || FALLBACK_IMG;
}

/** Store uploads as /uploads/file.jpg; keep full https URLs as-is */
function normalizeStoredImage(image) {
  if (!image || typeof image !== "string") return "";
  const trimmed = image.trim();
  if (!trimmed) return "";
  const idx = trimmed.indexOf("/uploads/");
  if (idx !== -1) return trimmed.slice(idx).split("?")[0];
  return trimmed;
}

module.exports = {
  API_BASE,
  FALLBACK_IMG,
  resolveImageUrl,
  getUploadFilename,
  withFallback,
  normalizeStoredImage,
};
