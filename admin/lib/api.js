import axios from "axios";
import { getApiUrl } from "./getApiUrl";

export function getAPIUrl() {
  return getApiUrl();
}

export function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = axios.create();

authApi.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  const headers = authHeaders();
  config.headers = { ...config.headers, ...headers };
  return config;
});
