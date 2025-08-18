// client/src/lib/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://invoice-backend-604217703209.asia-south1.run.app";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
// api.interceptors.request.use((config) => {
//   console.log("API Request:", {
//     url: config.url,
//     method: config.method,
//     data: config.data,
//     headers: config.headers,
//   });
//   return config;
// });
api.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

export default api;
