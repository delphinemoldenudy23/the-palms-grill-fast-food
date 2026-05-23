/** Production: set NEXT_PUBLIC_API_URL. Local / LAN: uses same host as the page. */
export function getApiUrl() {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (env) return env;

  if (typeof window !== "undefined" && window.location?.hostname) {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    if (protocol === "https:") {
      return `${protocol}//${hostname}`;
    }
    return `http://${hostname}:5000`;
  }

  return "http://localhost:5000";
}
