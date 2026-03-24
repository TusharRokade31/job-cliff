/**
 * services/api.js
 * Centralised Axios instance + all API call functions.
 * All requests go to our Express proxy → Job Cliff backend.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",           // Vite proxies /api → http://localhost:4000/api
  headers: { "Content-Type": "application/json" },
});

// Attach auth token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth — Employee ──────────────────────────────────────────
export const loginEmployee    = (body) => api.post("/users/login", body);
export const registerEmployee = (body) => api.post("/users/register", body);
export const forgotPassword   = (body) => api.post("/users/forgot-password", body);
export const getMyProfile     = ()     => api.get("/users/profile");
export const updateMyProfile  = (body) => api.post("/users/profile", body);
export const getMyApplications= ()     => api.get("/users/my-applications");
export const getSavedJobs     = ()     => api.get("/users/saved-jobs");

// ─── Auth — Employer ──────────────────────────────────────────
export const loginEmployer    = (body) => api.post("/employers/auth/login", body);
export const registerEmployer = (body) => api.post("/employers/auth/register", body);
export const getEmployerProfile = ()   => api.get("/employers/profile/detail");
export const updateEmployerProfile=(b) => api.put("/employers/profile/detail", b);

// ─── Jobs ─────────────────────────────────────────────────────
export const getJobs       = (params) => api.get("/jobs/listing", { params });
export const getJobById    = (id)     => api.get(`/jobs/${id}`);
export const createJob     = (body)   => api.post("/jobs/create", body);
export const applyToJob    = (id)     => api.post(`/jobs/${id}/apply`);
export const saveJob       = (id)     => api.post(`/jobs/${id}/save`);
export const unsaveJob     = (id)     => api.delete(`/jobs/${id}/save`);
export const getSaveStatus = (id)     => api.get(`/jobs/${id}/saved-status`);

// ─── Employers / Companies ────────────────────────────────────
export const getEmployers  = (params) => api.get("/employers", { params });
export const getEmployerById=(id)     => api.get(`/employers/${id}`);
export const getEmployerJobs=(id)     => api.get(`/employers/${id}/jobs/all`);

// ─── Home / Common ────────────────────────────────────────────
export const getBanners    = ()       => api.get("/common/banners");
export const getCourses    = (params) => api.get("/common/courses", { params });
export const getTrainers   = ()       => api.get("/common/trainers");
export const getBlogs      = (params) => api.get("/common/blogs", { params }); // Added Blogs API

export default api;