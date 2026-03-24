/**
 * routes/jobs.js
 * ── Only the POST /create route is changed. Rest stays the same. ──
 *
 * Changes from original:
 *   1. Import findTop10MatchingEmployeesForJob (new export from matchingService)
 *   2. Import sendTopCandidatesDigestToEmployer (new export from netcore)
 *   3. POST /create: after notifying candidates, also fetch employer profile
 *      and send them the top-10 digest email.
 */

const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const { requireAuth } = require("../middleware/auth");

// ── Updated imports ───────────────────────────────────────────────────────────
const {
  sendJobAlertToEmployees,
  sendTopCandidatesDigestToEmployer,       // ← NEW
} = require("../services/netcore");

const {
  findMatchingEmployeesForJob,
  findTop10MatchingEmployeesForJob,        // ← NEW
} = require("../services/matchingService");
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const BASE = process.env.JOB_CLIFF_API_BASE;

const apiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ── GET /api/jobs/listing ─────────────────────────────────────────────────────
router.get("/listing", async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/listing`, {
    params: req.query,
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/jobs/:jobId ──────────────────────────────────────────────────────
router.get("/:jobId", async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/${req.params.jobId}`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── POST /api/jobs/:jobId/apply ───────────────────────────────────────────────
router.post("/:jobId/apply", requireAuth, async (req, res) => {
  const { data } = await axios.post(
    `${BASE}/jobs/${req.params.jobId}/apply`,
    req.body,
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

// ── POST /api/jobs/:jobId/save ────────────────────────────────────────────────
router.post("/:jobId/save", requireAuth, async (req, res) => {
  const { data } = await axios.post(
    `${BASE}/jobs/${req.params.jobId}/save`,
    {},
    { headers: apiHeaders(req.authToken) }
  );
  res.json(data);
});

// ── DELETE /api/jobs/:jobId/save ──────────────────────────────────────────────
router.delete("/:jobId/save", requireAuth, async (req, res) => {
  const { data } = await axios.delete(`${BASE}/jobs/${req.params.jobId}/save`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ── GET /api/jobs/:jobId/saved-status ─────────────────────────────────────────
router.get("/:jobId/saved-status", requireAuth, async (req, res) => {
  const { data } = await axios.get(`${BASE}/jobs/${req.params.jobId}/saved-status`, {
    headers: apiHeaders(req.authToken),
  });
  res.json(data);
});

// ─────────────────────────────────────────────────────────────────────────────
// ★  POST /api/jobs/create  — TWO emails fired after job creation            ★
//
//   Email 1 → each matched candidate  (job alert)
//   Email 2 → the posting employer    (top 10 candidate digest)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create", requireAuth, async (req, res) => {

  // Step 1 — Create job in Job Cliff backend
  const { data: jobResponse } = await axios.post(
    `${BASE}/employers/jobs/add-new-job`,
    req.body,
    { headers: apiHeaders(req.authToken) }
  );

  const createdJob = jobResponse?.data || jobResponse?.job || req.body;

  // Step 2 — Fire both emails (non-blocking, so response is instant)
  (async () => {
    try {
      // ── Fetch employer profile to get their email ──────────────────────────
      // We need the employer's email to send the digest.
      // This calls the same endpoint used by GET /api/employers/profile/detail.
      let employerEmail = "";
      let employerName  = "";
      try {
        const { data: empProfile } = await axios.get(
          `${BASE}/employers/profile/get-detail`,
          { headers: apiHeaders(req.authToken) }
        );
        // Adjust field names to match your actual API response shape
        const profile  = empProfile?.data || empProfile?.employer || empProfile;
        employerEmail  = profile?.email         || "";
        employerName   = profile?.company_name  || profile?.name || "";
      } catch (profileErr) {
        console.error("[Jobs Route] Could not fetch employer profile:", profileErr.message);
        // Non-fatal — we just won't send the digest if we can't get the email
      }

      // ── Find matches ───────────────────────────────────────────────────────
      // findTop10MatchingEmployeesForJob scores + slices top 10.
      // findMatchingEmployeesForJob (all matches) used separately for candidate alerts.
      const [top10, allMatched] = await Promise.all([
        findTop10MatchingEmployeesForJob(createdJob, req.authToken),
        findMatchingEmployeesForJob(createdJob, req.authToken),
      ]);

      console.log(
        `[Jobs Route] ${allMatched.length} total matches | top ${top10.length} for digest | job: "${createdJob.title || createdJob.job_title}"`
      );

      // ── Email 1: notify each matched candidate ─────────────────────────────
      if (allMatched.length > 0) {
        await sendJobAlertToEmployees(createdJob, allMatched);
        console.log("[Jobs Route] ✅ Candidate job-alert emails sent.");
      } else {
        console.log("[Jobs Route] No matching candidates — skipping candidate alerts.");
      }

      // ── Email 2: send employer the top-10 digest ───────────────────────────
      if (employerEmail && top10.length > 0) {
        await sendTopCandidatesDigestToEmployer(createdJob, employerEmail, employerName, top10);
        console.log("[Jobs Route] ✅ Employer top-candidates digest sent.");
      } else if (!employerEmail) {
        console.log("[Jobs Route] No employer email — skipping digest.");
      } else {
        console.log("[Jobs Route] No top candidates — skipping digest.");
      }

    } catch (err) {
      console.error("[Jobs Route] Email trigger failed (non-blocking):", err.message);
    }
  })();

  // Respond immediately — emails fire in the background
  res.status(201).json({
    ...jobResponse,
    _notification: "Candidate alerts + employer digest will be sent in the background.",
  });
});

module.exports = router;