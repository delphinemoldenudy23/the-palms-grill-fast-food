import axios from "axios";
import { getApiUrl } from "./getApiUrl";

export function getAPIUrl() {
  return getApiUrl();
}

export const api = axios.create();

api.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  return config;
});
