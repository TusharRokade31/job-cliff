/**
 * matchingService.js
 * ──────────────────────────────────────────────────────────
 * Determines which employees match a job post,
 * and which employers' jobs match a candidate's profile.
 *
 * Matching Criteria:
 *   ✓ Job Role / Title  (fuzzy contains)
 *   ✓ Skills            (overlap count — used for scoring)
 * ──────────────────────────────────────────────────────────
 */

const axios = require("axios");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const BASE_URL = process.env.JOB_CLIFF_API_BASE;

const norm = (str = "") => String(str).toLowerCase().trim();

function skillsOverlap(jobSkills = [], candidateSkills = []) {
  const jobSet = new Set(jobSkills.map(norm));
  return candidateSkills.some((s) => jobSet.has(norm(s)));
}

/** Returns count of overlapping skills (used for ranking) */
function skillsOverlapCount(jobSkills = [], candidateSkills = []) {
  const jobSet = new Set(jobSkills.map(norm));
  return candidateSkills.filter((s) => jobSet.has(norm(s))).length;
}

function titleMatches(jobTitle = "", candidateTitle = "") {
  const jt = norm(jobTitle);
  const ct = norm(candidateTitle);
  return jt.includes(ct) || ct.includes(jt) || jt === ct;
}

/**
 * scoreMatch
 * ──────────
 * Returns a numeric relevance score for a candidate against a job.
 * Higher = better match.
 *
 * Scoring:
 *   Title match     → +10
 *   Each skill hit  → +3
 */
function scoreMatch(job, candidate) {
  let score = 0;

  if (titleMatches(
    job.title || job.job_title || "",
    candidate.job_title || candidate.desired_role || ""
  )) {
    score += 10;
  }

  score += skillsOverlapCount(
    job.skills || job.required_skills || [],
    candidate.skills || []
  ) * 3;

  return score;
}

/**
 * findMatchingEmployeesForJob
 * ────────────────────────────
 * Fetches the employee/user listing and returns those whose
 * title / skills match the provided job.
 *
 * ⚠️  Replace the endpoint below with your actual user-listing URL
 *     once confirmed (e.g. /users/listing?page=1&limit=200).
 *     Current endpoint mirrors the pattern used by other list routes.
 */
async function findMatchingEmployeesForJob(job, authToken = "") {
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    // ── Fetch candidate pool ──────────────────────────────────
    // TODO: confirm the correct users-listing endpoint with your backend team.
    //       Trying /users?page=1&limit=200 as a reasonable default.
    const { data } = await axios.get(`${BASE_URL}/users?page=1&limit=200`, { headers });

    const employees = data?.data || data?.users || data?.employees || [];

    return employees.filter((emp) => {
      const titleMatch = titleMatches(
        job.title || job.job_title || "",
        emp.job_title || emp.desired_role || ""
      );
      const skillMatch = skillsOverlap(
        job.skills || job.required_skills || [],
        emp.skills || []
      );
      return titleMatch || skillMatch;
    });
  } catch (err) {
    console.error("[MatchingService] Error fetching employees:", err.message);
    return [];
  }
}

/**
 * findTop10MatchingEmployeesForJob
 * ─────────────────────────────────
 * Same as findMatchingEmployeesForJob but:
 *   1. Scores each match
 *   2. Sorts highest → lowest
 *   3. Returns at most 10 candidates
 *
 * Use this to build the employer digest email.
 */
async function findTop10MatchingEmployeesForJob(job, authToken = "") {
  const matched = await findMatchingEmployeesForJob(job, authToken);

  return matched
    .map((emp) => ({ ...emp, _matchScore: scoreMatch(job, emp) }))
    .sort((a, b) => b._matchScore - a._matchScore)
    .slice(0, 10);
}

/**
 * findMatchingJobsForCandidate
 * ──────────────────────────────
 * Fetches all active job listings and returns those that match
 * the candidate's desired role and skills.
 */
async function findMatchingJobsForCandidate(candidate) {
  try {
    const { data } = await axios.get(`${BASE_URL}/jobs/listing?page=1&limit=100`);
    const jobs = data?.data || data?.jobs || [];

    return jobs.filter((job) => {
      const titleMatch = titleMatches(
        job.title || job.job_title || "",
        candidate.desired_role || candidate.job_title || ""
      );
      const skillMatch = skillsOverlap(
        job.skills || job.required_skills || [],
        candidate.skills || []
      );
      return titleMatch || skillMatch;
    });
  } catch (err) {
    console.error("[MatchingService] Error fetching jobs:", err.message);
    return [];
  }
}

module.exports = {
  findMatchingEmployeesForJob,
  findTop10MatchingEmployeesForJob,  // ← NEW export
  findMatchingJobsForCandidate,
};