/**
 * routes/users.js
 * ──────────────────────────────────────────────────────────
 * Proxies user (employee) requests to Job Cliff API.
 *
 * KEY INTEGRATION POINTS:
 *   POST /api/users/register
 *     → Registers employee
 *     → Fires Netcore "Candidate Alert" to matching employers
 *
 *   POST /api/users/profile
 *     → Updates employee profile
 *     → Fires Netcore "Candidate Alert" to matching employers
 * ──────────────────────────────────────────────────────────
 */

const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth");
const { sendCandidateAlertToEmployers } = require("../services/netcore");
const { findMatchingJobsForCandidate } = require("../services/matchingService");

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const BASE = process.env.JOB_CLIFF_API_BASE;

const apiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ─────────────────────────────────────────────────────────────
// Helper — run matching + send candidate alert asynchronously
// ─────────────────────────────────────────────────────────────
async function notifyMatchingEmployers(candidateProfile) {
  try {
    const matchedJobs = await findMatchingJobsForCandidate(candidateProfile);
    console.log(`[Users Route] ${matchedJobs.length} jobs matched for candidate: "${candidateProfile.full_name || candidateProfile.name}"`);

    if (matchedJobs.length > 0) {
      await sendCandidateAlertToEmployers(candidateProfile);
      console.log("[Users Route] ✅ Netcore Candidate Alert campaign triggered.");
    } else {
      console.log("[Users Route] No matching jobs found — skipping email campaign.");
    }
  } catch (err) {
    console.error("[Users Route] Netcore trigger failed (non-blocking):", err.message);
  }
}

// ── POST /api/users/login ─────────────────────────────────
router.post("/login", async (req, res) => {
  const { data } = await axios.post(`${BASE}/users/Login`, req.body, {
    headers: apiHeaders(),
  });
  res.json(data);
});

// ─────────────────────────────────────────────────────────
// ★  POST /api/users/register  ← NETCORE TRIGGER POINT   ★
// ─────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  // Step 1 — Register user in Job Cliff backend
  const { data: registerResponse } = await axios.post(`${BASE}/users`, req.body, {
    headers: apiHeaders(),
  });

  // Step 2 — Fire Netcore Candidate Alert (non-blocking)
  notifyMatchingEmployers(req.body);

  res.status(201).json({
    ...registerResponse,
    _notification: "Employer notifications will be sent for matching job posts.",
  });
});

// ─────────────────────────────────────────────────────────
// ★  POST /api/users/profile  ← NETCORE TRIGGER POINT    ★
// ─────────────────────────────────────────────────────────
router.post("/profile", requireAuth, async (req, res) => {
  // Step 1 — Update profile in Job Cliff backend
  const { data: profileResponse } = await axios.post(
    `${BASE}/users/profile-details`,
    req.body,
    { headers: apiHeaders(req.authToken) }
  );

  // Step 2 — Fire Netcore Candidate Alert (non-blocking)
  notifyMatchingEmployers(req.body);

  res.json({
    ...profileResponse,
    _notification: "Employer notifications will be sent for matching job posts.",
  });
});

// ── GET /api/users/profile ────────────────────────────────
router.get("/profile", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/users/get-detail`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── POST /api/users/forgot-password ──────────────────────
router.post("/forgot-password", async (req, res) => {
  const { data } = await axios.post(`${BASE}/users/forgot-password`, req.body, {
    headers: apiHeaders(),
  });
  res.json(data);
});

// ── GET /api/users/my-applications ───────────────────────
router.get("/my-applications", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/my-applications`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/users/saved-jobs ─────────────────────────────
router.get("/saved-jobs", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/saved-jobs`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

module.exports = router;
