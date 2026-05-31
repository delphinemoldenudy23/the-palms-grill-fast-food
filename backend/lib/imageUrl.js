const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

// Log API_BASE for debugging
if (process.env.NODE_ENV !== "production") {
  console.log("Image URL API_BASE:", API_BASE);
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop";

function resolveImageUrl(image) {
  if (!image || typeof image !== "string" || !image.trim()) {
    return "";
  }
  const trimmed = image.trim();
  // Cloudinary URLs are full HTTPS URLs, return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Legacy /uploads/ paths (for backward compatibility during migration)
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }
  return `${API_BASE}/uploads/${trimmed}`;
}

function getUploadFilename(image) {
  if (!image || typeof image !== "string") return null;
  // For Cloudinary, extract public_id if possible
  const cloudinaryMatch = image.match(/\/v\d+\/([^/]+)/);
  if (cloudinaryMatch) return cloudinaryMatch[1];
  // Legacy support for /uploads/ paths
  const legacyMatch = image.match(/\/uploads\/([^/?#]+)/);
  return legacyMatch ? legacyMatch[1] : null;
}

function withFallback(image) {
  return resolveImageUrl(image) || FALLBACK_IMG;
}

/** Normalize image for storage - Cloudinary URLs are stored as-is */
function normalizeStoredImage(image) {
  if (!image || typeof image !== "string") return "";
  const trimmed = image.trim();
  if (!trimmed) return "";
  // Cloudinary URLs are full URLs, store as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Legacy support for /uploads/ paths
  const idx = trimmed.indexOf("/uploads/");
  if (idx !== -1) return trimmed.slice(idx);
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
