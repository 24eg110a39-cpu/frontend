import axios from "axios";

// All requests go to the Spring Boot backend. The JWT token is added automatically.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired or invalid token -> back to the login page
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || "Cannot reach the server. Check that the Spring Boot backend is running on port 8080.";

export const today = () => new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd in local time

export default api;
