/**
 * routes/jobs.js
 * ──────────────────────────────────────────────────────────
 * Proxies job-related requests to the Job Cliff backend API.
 *
 * KEY INTEGRATION POINT:
 *   POST /api/jobs/create
 *     → Creates job via Job Cliff API
 *     → Finds matching employees (title + skills)
 *     → Fires Netcore "Job Alert" email campaign
 * ──────────────────────────────────────────────────────────
 */

const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth");
const { sendJobAlertToEmployees } = require("../services/netcore");
const { findMatchingEmployeesForJob } = require("../services/matchingService");

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const BASE = process.env.JOB_CLIFF_API_BASE;

const apiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ── GET /api/jobs/listing ─────────────────────────────────
router.get("/listing", async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/listing`, {
    params: req.query,
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/jobs/:jobId ──────────────────────────────────
router.get("/:jobId", async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/${req.params.jobId}`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── POST /api/jobs/:jobId/apply ───────────────────────────
router.post("/:jobId/apply", requireAuth, async (req, res) => {
  const { data } = await axios.post(
    `${BASE}/jobs/${req.params.jobId}/apply`,
    req.body,
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

// ── POST /api/jobs/:jobId/save ────────────────────────────
router.post("/:jobId/save", requireAuth, async (req, res) => {
  const { data } = await axios.post(
    `${BASE}/jobs/${req.params.jobId}/save`,
    {},
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

// ── DELETE /api/jobs/:jobId/save ──────────────────────────
router.delete("/:jobId/save", requireAuth, async (req, res) => {
  const { data } = await axios.delete(`${BASE}/jobs/${req.params.jobId}/save`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/jobs/:jobId/saved-status ────────────────────
router.get("/:jobId/saved-status", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/${req.params.jobId}/saved-status`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ─────────────────────────────────────────────────────────
// ★  POST /api/jobs/create  ← CORE NETCORE TRIGGER POINT  ★
// ─────────────────────────────────────────────────────────
/**
 * Flow:
 * 1. Forward job creation request to Job Cliff employer API
 * 2. On success, find employees that match title + skills
 * 3. Fire Netcore "Job Alert" email campaign to matched employees
 */
router.post("/create", requireAuth, async (req, res) => {
  // Step 1 — Create job in Job Cliff backend
  const { data: jobResponse } = await axios.post(
    `${BASE}/employers/jobs/add-new-job`,
    req.body,
    { headers: apiHeaders(req.authToken) }
  );

  const createdJob = jobResponse?.data || jobResponse?.job || req.body;

  // Step 2 — Find matching employees asynchronously
  // We don't block the response for email sending
  (async () => {
    try {
      const matched = await findMatchingEmployeesForJob(createdJob, req.authToken);
      console.log(`[Jobs Route] ${matched.length} employees matched for job: "${createdJob.title}"`);

      if (matched.length > 0) {
        // Step 3 — Fire Netcore campaign
        await sendJobAlertToEmployees(createdJob);
        console.log("[Jobs Route] ✅ Netcore Job Alert campaign triggered.");
      } else {
        console.log("[Jobs Route] No matching employees found — skipping email campaign.");
      }
    } catch (err) {
      // Email failure should NOT affect job creation response
      console.error("[Jobs Route] Netcore trigger failed (non-blocking):", err.message);
    }
  })();

  // Respond immediately after job creation
  res.status(201).json({
    ...jobResponse,
    _notification: "Email alert will be sent to matching candidates.",
  });
});

module.exports = router;
