import axios from "axios";
import { getAdminToken } from "./auth";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    // attach JWT token for protected admin routes
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
