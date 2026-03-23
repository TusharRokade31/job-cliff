/**
 * matchingService.js
 * ──────────────────────────────────────────────────────────
 * Determines which employees match a job post,
 * and which employers' jobs match a candidate's profile.
 *
 * Matching Criteria (as configured by client):
 *   ✓ Job Role / Title
 *   ✓ Skills
 * ──────────────────────────────────────────────────────────
 */

const axios = require("axios");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const BASE_URL = process.env.JOB_CLIFF_API_BASE;

/**
 * Normalise a string for comparison — lowercase + trim
 */
const norm = (str = "") => String(str).toLowerCase().trim();

/**
 * Check if two skill arrays overlap (at least one common skill)
 */
function skillsOverlap(jobSkills = [], candidateSkills = []) {
  const jobSet = new Set(jobSkills.map(norm));
  return candidateSkills.some((s) => jobSet.has(norm(s)));
}

/**
 * Check if candidate's desired role/title matches the job title
 */
function titleMatches(jobTitle = "", candidateTitle = "") {
  const jt = norm(jobTitle);
  const ct = norm(candidateTitle);
  // fuzzy: if either contains the other
  return jt.includes(ct) || ct.includes(jt) || jt === ct;
}

/**
 * findMatchingEmployeesForJob
 * ────────────────────────────
 * Fetches the employee listing from Job Cliff API and returns
 * those whose title / skills match the provided job.
 *
 * NOTE: The Job Cliff API doesn't expose a direct
 *       "list all employees" endpoint in the CSV.
 *       We use the applied-users approach or a best-available endpoint.
 *       In production, replace with your actual employee search/listing endpoint.
 *
 * @param {object} job - job object { title, skills }
 * @param {string} authToken - bearer token for auth'd endpoints
 * @returns {Array} matched employees
 */
async function findMatchingEmployeesForJob(job, authToken = "") {
  try {
    // Fetch recent job applicants / users as a proxy for the employee pool
    // TODO: Replace with actual employee listing endpoint when available
    const headers = authToken
      ? { Authorization: `Bearer ${authToken}` }
      : {};

    const { data } = await axios.get(`${BASE_URL}/jobs/listing?page=1&limit=100`, {
      headers,
    });

    const employees = data?.data || data?.employees || [];

    // Filter: match by title OR skills
    return employees.filter((emp) => {
      const titleMatch = titleMatches(job.title, emp.job_title || emp.desired_role || "");
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
 * findMatchingJobsForCandidate
 * ──────────────────────────────
 * Fetches all active job listings and returns those that match
 * the candidate's desired role and skills.
 *
 * @param {object} candidate - { desired_role, job_title, skills }
 * @returns {Array} matched jobs
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
  findMatchingJobsForCandidate,
};
