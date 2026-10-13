import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  withCredentials: true
});

// Attach Authorization header if token is in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers["X-Admin-Token"] = adminToken;
  }
  return config;
});

export const authApi = {
  register: (data) => API.post("/auth/register", data),
  verifyOtp: (data) => API.post("/auth/verify-otp", data),
  resendOtp: (data) => API.post("/auth/resend-otp", data),
  login: (data) => API.post("/auth/login", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  getMe: () => API.get("/auth/me"),
  logout: () => API.post("/auth/logout")
};

export const interviewApi = {
  getCategories: () => API.get("/interview/categories"),
  getStatus: () => API.get("/interview/status"),
  start: (data) => API.post("/interview/start", data),
  submit: (data) => API.post("/interview/submit", data),
  terminate: (data) => API.post("/interview/terminate", data),
  getResult: (id) => API.get(`/interview/result/${id}`),
  downloadReportUrl: (id) => `/api/interview/result/${id}/report`
};

export const dashboardApi = {
  getStats: () => API.get("/dashboard/stats")
};

export const adminApi = {
  login: (data) => API.post("/admin/login", data),
  getStats: () => API.get("/admin/stats"),
  getResult: (id) => API.get(`/admin/result/${id}`),
  deleteResult: (id) => API.delete(`/admin/result/${id}`),
  mailCandidate: (id) => API.post(`/admin/result/${id}/mail`)
};

export const resumeApi = {
  uploadResume: (formData) =>
    API.post("/resume/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  getMyResume: () => API.get("/resume/my-resume")
};

export default API;

