/**
 * server/index.js
 * ──────────────────────────────────────────────────────────
 * Job Cliff — Express Server
 *
 * Responsibilities:
 *  • Proxy requests to the Job Cliff backend API
 *  • Intercept job creation & user registration to
 *    trigger Netcore email campaigns
 * ──────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("express-async-errors");

const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

const { extractToken } = require("./middleware/auth");

// ── Route imports ─────────────────────────────────────────
const jobsRouter      = require("./routes/jobs");
const usersRouter     = require("./routes/users");
const employersRouter = require("./routes/employers");
const commonRouter    = require("./routes/common");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Global middleware ─────────────────────────────────────
app.use(cors({ origin: "*" }));          // Tighten in production
app.use(express.json());
app.use(morgan("dev"));
app.use(extractToken);                   // Attaches req.authToken on every request

// ── Health check ──────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── API Routes ────────────────────────────────────────────
app.use("/api/jobs",      jobsRouter);
app.use("/api/users",     usersRouter);
app.use("/api/employers", employersRouter);
app.use("/api/common",    commonRouter);

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("[Server Error]", err.message);

  // Axios errors from proxied calls
  if (err.response) {
    return res.status(err.response.status).json({
      success: false,
      message: err.response.data?.message || "Upstream API error",
      upstream: err.response.data,
    });
  }

  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

app.get("/test-email", async (req, res) => {
  const { sendJobAlertToEmployee } = require("./services/netcore");
  try {
    const result = await sendJobAlertToEmployee(
      {
        title: "Frontend Developer",
        company_name: "Job Cliff",
        job_location: "Mumbai",
        job_type: "Full-time",
        salary_range: "₹8–12 LPA",
        skills: ["React", "Node.js"],
        _id: "test123",
      },
      "rokadetushar122@gmail.com",   // ← your own email to test
      "Tushar Rokade"
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Job Cliff Server running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Proxying Job Cliff API: ${process.env.JOB_CLIFF_API_BASE}\n`);
});

module.exports = app;
