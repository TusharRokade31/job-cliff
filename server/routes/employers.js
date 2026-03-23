/**
 * routes/employers.js
 * Proxies employer-related requests to the Job Cliff backend API.
 */

const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth");

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const BASE = process.env.JOB_CLIFF_API_BASE;

const apiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ── GET /api/employers ────────────────────────────────────
router.get("/", async (req, res) => {
  const { data } = await axios.get(`${BASE}/employers`, {
    params: req.query,
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/employers/:id ────────────────────────────────
router.get("/:id", async (req, res) => {
  const { data } = await axios.get(`${BASE}/employers/${req.params.id}`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── POST /api/employers/auth/register ────────────────────
router.post("/auth/register", async (req, res) => {
  const { data } = await axios.post(`${BASE}/employers/auth/register`, req.body, {
    headers: apiHeaders(),
  });
  res.status(201).json(data);
});

// ── POST /api/employers/auth/login ───────────────────────
router.post("/auth/login", async (req, res) => {
  const { data } = await axios.post(`${BASE}/employers/auth/login`, req.body, {
    headers: apiHeaders(),
  });
  res.json(data);
});

// ── GET /api/employers/profile ────────────────────────────
router.get("/profile/detail", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/employers/profile/get-detail`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── PUT /api/employers/profile ────────────────────────────
router.put("/profile/detail", requireAuth, async (req, res) => {
  const { data } = await axios.put(`${BASE}/employers/profile/get-detail`, req.body, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/employers/jobs/list ──────────────────────────
router.get("/jobs/list", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/employers/jobs/employer-jobs`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/employers/jobs/:jobId/applied-users ──────────
router.get("/jobs/:jobId/applied-users", requireAuth, async (req, res) => {
  const { data } = await axios.get(
    `${BASE}/employers/jobs/applied-users/${req.params.jobId}`,
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

// ── GET /api/employers/:companyId/reviews ─────────────────
router.get("/:companyId/reviews", async (req, res) => {
  const { data } = await axios.get(
    `${BASE}/employers/${req.params.companyId}/reviews`,
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

module.exports = router;
