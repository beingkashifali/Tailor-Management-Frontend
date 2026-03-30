import axios from "axios";

const API = axios.create({
  baseURL: "https://tailor-management-backend.onrender.com", // Replace with your backend URL
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
