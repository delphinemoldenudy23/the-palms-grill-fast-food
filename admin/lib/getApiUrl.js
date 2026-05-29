export function getApiUrl() {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (env) return env;

  return "https://palms-grill-backend.onrender.com";
}