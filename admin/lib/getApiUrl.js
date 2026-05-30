export function getApiUrl() {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (env) return env;

  // Use localhost for local development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return "https://palms-grill-backend.onrender.com";
}