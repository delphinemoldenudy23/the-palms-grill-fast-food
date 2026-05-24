import axios from "axios";
import { getApiUrl } from "./getApiUrl";

const api = axios.create({
  baseURL: getApiUrl()
});

export { api };