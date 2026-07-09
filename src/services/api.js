import axios from "axios";

// Environment Mapping
export const REGIONS = {
  DEV   : "https://hora-dev-backend.onrender.com",
  STAGE : "https://backend-sd-c6i1.onrender.com",
  PROD  : "https://backend-sd-c6i1.onrender.com"
};

// Initial base URL based on saved region
const getBaseURL = () => {
    const savedRegion = localStorage.getItem("hora_region") || "DEV";
    return REGIONS[savedRegion] || REGIONS.DEV;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility to switch base URL instantly
export const setBaseRegion = (region) => {
    localStorage.setItem("hora_region", region);
    const newBase = REGIONS[region] || REGIONS.DEV;
    api.defaults.baseURL = newBase;
    return newBase;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("internal_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("internal_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// AUTH ENDPOINTS
export const login = async (email, password) => {
  const response = await api.post("/api/internal/auth/login", { email, password });
  if (response.data.success) {
    localStorage.setItem("internal_token", response.data.token);
  }
  return response.data;
};

export const resetPassword = async (email, newPassword) => {
  const response = await api.post("/api/internal/auth/reset-password", { email, newPassword });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/internal/auth/me");
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("internal_token");
  window.location.href = "/login";
};

export default api;
