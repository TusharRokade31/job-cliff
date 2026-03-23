/**
 * routes/common.js
 * Proxies home screen / common endpoints to Job Cliff API.
 */

const express = require("express");
const axios   = require("axios");
const router  = express.Router();

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const BASE = process.env.JOB_CLIFF_API_BASE;

// ── GET /api/common/banners ───────────────────────────────
router.get("/banners", async (_req, res) => {
  const { data } = await axios.get(`${BASE}/common/whatsnew_banner/all`);
  res.json(data);
});

// ── GET /api/common/courses ───────────────────────────────
router.get("/courses", async (req, res) => {
  const { data } = await axios.get(`${BASE}/courses`, { params: req.query });
  res.json(data);
});

// ── GET /api/common/trainers ──────────────────────────────
router.get("/trainers", async (_req, res) => {
  const { data } = await axios.get(`${BASE}/common/all_instructor`);
  res.json(data);
});

// ── POST /api/common/contact ──────────────────────────────
router.post("/contact", async (req, res) => {
  const { data } = await axios.post(`${BASE}/common/contact/submit`, req.body, {
    headers: { "Content-Type": "application/json" },
  });
  res.json(data);
});

module.exports = router;
