/**
 * netcore.js
 * ──────────────────────────────────────────────────────────
 * Netcore Transactional Email API — No templates, no list IDs needed.
 * Sends inline HTML emails directly to recipient email addresses.
 *
 * API Reference:
 *   POST https://emailapi.netcorecloud.net/v5/mail/send
 *   Header: api_key: <your key>
 *
 * TWO email types fired from this service:
 *   1. JOB ALERT       → employee gets email when a matching job is posted
 *   2. CANDIDATE ALERT → employer gets email when a matching candidate registers
 * ──────────────────────────────────────────────────────────
 */

const axios = require("axios");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const SEND_URL    = process.env.NETCORE_EMAIL_SEND_URL;  // https://emailapi.netcorecloud.net/v5/mail/send
const API_KEY     = process.env.NETCORE_API_KEY;
const SENDER_NAME  = process.env.NETCORE_SENDER_NAME;
const SENDER_EMAIL = process.env.NETCORE_SENDER_EMAIL;

// ─── Axios headers ────────────────────────────────────────
const HEADERS = {
  "api_key": API_KEY,           // Netcore uses api_key (not Authorization Bearer)
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────
// INTERNAL HELPER — sends one transactional email
// ─────────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string}   opts.toEmail    - recipient email address
 * @param {string}   opts.toName     - recipient display name
 * @param {string}   opts.subject    - email subject line
 * @param {string}   opts.htmlBody   - full HTML content of the email
 */
async function _sendEmail({ toEmail, toName, subject, htmlBody }) {
  const payload = {
    from: {
      email: SENDER_EMAIL,
      name:  SENDER_NAME,
    },
    subject,
    content: [
      {
        type:  "html",
        value: htmlBody,
      },
    ],
    personalizations: [
      {
        to: [
          {
            email: toEmail,
            name:  toName || toEmail,
          },
        ],
      },
    ],
  };

  const response = await axios.post(SEND_URL, payload, { headers: HEADERS });
  return response.data;
}

// ─────────────────────────────────────────────────────────
// HTML BUILDERS — inline email templates (no Netcore template needed)
// ─────────────────────────────────────────────────────────

/**
 * Builds the HTML for the Job Alert email sent to employees.
 */
function buildJobAlertHTML(job) {
  const title    = job.title    || job.job_title    || "New Job Opening";
  const company  = job.company_name || job.employer_name || "A Top Company";
  const location = job.job_location || job.location  || "—";
  const type     = job.job_type || job.employment_type || "Full-time";
  const salary   = job.salary_range || job.salary     || "Not disclosed";
  const skills   = (Array.isArray(job.skills) ? job.skills : []).join(", ") || "—";
  const jobId    = job._id || job.id || "";
  const applyUrl = `http://localhost:5173/jobs/${jobId}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Job Alert — Job Cliff</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#ff6b35;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
              <span style="color:#ffe0d0;">Job</span>Cliff
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              A new job matching your profile is available
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a2e;font-weight:700;">${title}</h2>
            <p  style="margin:0 0 20px;font-size:15px;color:#555;">${company}</p>

            <!-- Details Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9fb;border-radius:8px;padding:16px;margin-bottom:20px;">
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;width:120px;">📍 Location</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${location}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;">⏱ Job Type</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${type}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;">💰 Salary</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${salary}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;">🛠 Skills</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${skills}</td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background:#ff6b35;border-radius:8px;">
                  <a href="${applyUrl}"
                     style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                    View &amp; Apply →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center;">
              You're receiving this because your profile matches this job.<br/>
              Job Cliff — Find Your Next Role
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the HTML for the Candidate Alert email sent to employers.
 */
function buildCandidateAlertHTML(candidate) {
  const name   = candidate.full_name || candidate.name || "A new candidate";
  const role   = candidate.job_title || candidate.desired_role || "Open to opportunities";
  const skills = (Array.isArray(candidate.skills) ? candidate.skills : []).join(", ") || "—";
  const email  = candidate.email || "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Candidate Alert — Job Cliff</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">
              <span style="color:#ddd6fe;">Job</span>Cliff
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              A candidate matching your job requirements has registered
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a2e;font-weight:700;">${name}</h2>
            <p  style="margin:0 0 20px;font-size:15px;color:#555;">Looking for: ${role}</p>

            <!-- Details Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9fb;border-radius:8px;padding:16px;margin-bottom:20px;">
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;width:120px;">🎯 Desired Role</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${role}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;">🛠 Skills</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${skills}</td>
              </tr>
              <tr>
                <td style="padding:6px 12px;font-size:13px;color:#888;">📧 Contact</td>
                <td style="padding:6px 12px;font-size:13px;color:#222;font-weight:500;">${email}</td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background:#7c3aed;border-radius:8px;">
                  <a href="http://localhost:5173/login"
                     style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;">
                    View Candidate Profile →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:12px;color:#aaa;text-align:center;">
              You're receiving this because a candidate matches your open positions.<br/>
              Job Cliff — Hire the Right Talent
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────

/**
 * sendJobAlertToEmployee
 * ─────────────────────────
 * Sends ONE job alert email to a single matched employee.
 * Call this in a loop for multiple recipients.
 *
 * @param {object} job       - the created job object
 * @param {string} toEmail   - employee's email address
 * @param {string} toName    - employee's name
 */
async function sendJobAlertToEmployee(job, toEmail, toName = "") {
  const subject  = `New Job Match: ${job.title || "New Opening"} at ${job.company_name || "a top company"}`;
  const htmlBody = buildJobAlertHTML(job);

  console.log(`[Netcore] Sending Job Alert to: ${toEmail} for job "${job.title}"`);

  const result = await _sendEmail({ toEmail, toName, subject, htmlBody });

  console.log(`[Netcore] ✅ Job Alert sent to ${toEmail}:`, result);
  return result;
}

/**
 * sendJobAlertToEmployees
 * ─────────────────────────
 * Convenience wrapper — sends job alert to an ARRAY of matched employees.
 *
 * @param {object}   job       - the created job object
 * @param {Array}    employees - array of { email, name/full_name } objects
 */
async function sendJobAlertToEmployees(job, employees = []) {
  if (!employees.length) {
    console.log("[Netcore] No matched employees to notify.");
    return;
  }

  const results = await Promise.allSettled(
    employees.map((emp) =>
      sendJobAlertToEmployee(job, emp.email, emp.full_name || emp.name || "")
    )
  );

  const sent   = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[Netcore] Job Alert: ${sent} sent, ${failed} failed.`);
  return results;
}

/**
 * sendCandidateAlertToEmployer
 * ──────────────────────────────
 * Sends ONE candidate alert email to a single matched employer.
 *
 * @param {object} candidate  - the registered employee profile
 * @param {string} toEmail    - employer's email address
 * @param {string} toName     - employer's name / company name
 */
async function sendCandidateAlertToEmployer(candidate, toEmail, toName = "") {
  const name     = candidate.full_name || candidate.name || "A new candidate";
  const role     = candidate.job_title || candidate.desired_role || "a relevant role";
  const subject  = `New Candidate: ${name} is looking for ${role}`;
  const htmlBody = buildCandidateAlertHTML(candidate);

  console.log(`[Netcore] Sending Candidate Alert to: ${toEmail} for candidate "${name}"`);

  const result = await _sendEmail({ toEmail, toName, subject, htmlBody });

  console.log(`[Netcore] ✅ Candidate Alert sent to ${toEmail}:`, result);
  return result;
}

/**
 * sendCandidateAlertToEmployers
 * ──────────────────────────────
 * Convenience wrapper — sends candidate alert to an ARRAY of matched employers.
 *
 * @param {object} candidate  - the registered employee profile
 * @param {Array}  employers  - array of { email, company_name/name } objects
 */
async function sendCandidateAlertToEmployers(candidate, employers = []) {
  if (!employers.length) {
    console.log("[Netcore] No matched employers to notify.");
    return;
  }

  const results = await Promise.allSettled(
    employers.map((emp) =>
      sendCandidateAlertToEmployer(candidate, emp.email, emp.company_name || emp.name || "")
    )
  );

  const sent   = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[Netcore] Candidate Alert: ${sent} sent, ${failed} failed.`);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// PASTE THIS BLOCK into server/services/netcore.js
// Place it just BEFORE the module.exports at the bottom of the file.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildEmployerTopCandidatesHTML
 * ──────────────────────────────
 * Builds one digest email for the employer listing up to 10 matched candidates.
 *
 * @param {object} job        - the newly created job
 * @param {Array}  candidates - scored+ranked candidate objects (max 10)
 */
function buildEmployerTopCandidatesHTML(job, candidates = []) {
  const jobTitle   = job.title || job.job_title || "Your Job Post";
  const company    = job.company_name || job.employer_name || "Your Company";

  const candidateRows = candidates.map((c, idx) => {
    const name   = c.full_name || c.name || "Candidate";
    const role   = c.job_title || c.desired_role || "—";
    const skills = (Array.isArray(c.skills) ? c.skills : []).join(", ") || "—";
    const email  = c.email || "—";
    const exp    = c.experience || c.total_experience || "—";
    const score  = c._matchScore || 0;

    return `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;font-weight:600;vertical-align:top;">
        ${idx + 1}. ${name}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;vertical-align:top;">
        ${role}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;vertical-align:top;">
        ${skills}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;vertical-align:top;">
        ${exp}
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;font-size:13px;vertical-align:top;">
        <a href="mailto:${email}" style="color:#7c3aed;text-decoration:none;">${email}</a>
      </td>
      <td style="padding:12px;border-bottom:1px solid #f0f0f0;vertical-align:top;text-align:center;">
        <span style="background:#ede9fe;color:#7c3aed;font-size:11px;font-weight:700;padding:3px 8px;border-radius:12px;">
          ${score} pts
        </span>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Top Matched Candidates — Job Cliff</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">
              <span style="color:#ddd6fe;">Job</span>Cliff
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              Top matched candidates for your new job post
            </p>
          </td>
        </tr>

        <!-- Job summary -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h2 style="margin:0 0 4px;font-size:19px;color:#1a1a2e;font-weight:700;">${jobTitle}</h2>
            <p style="margin:0 0 6px;font-size:14px;color:#888;">${company}</p>
            <p style="margin:0;font-size:13px;color:#555;">
              We found <strong>${candidates.length}</strong> candidate${candidates.length !== 1 ? "s" : ""} whose profile closely matches this role.
              Here are the top matches ranked by relevance:
            </p>
          </td>
        </tr>

        <!-- Candidates table -->
        <tr>
          <td style="padding:20px 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #e8e8ee;border-radius:8px;overflow:hidden;">
              <!-- Table header -->
              <tr style="background:#f5f3ff;">
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:left;font-weight:600;">Name</th>
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:left;font-weight:600;">Role</th>
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:left;font-weight:600;">Skills</th>
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:left;font-weight:600;">Exp</th>
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:left;font-weight:600;">Contact</th>
                <th style="padding:10px 12px;font-size:12px;color:#7c3aed;text-align:center;font-weight:600;">Score</th>
              </tr>
              ${candidateRows}
            </table>

            <p style="margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;">
              Scores are based on title + skill overlap. Log in to Job Cliff to view full profiles.<br/>
              Job Cliff — Hire the Right Talent
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * sendTopCandidatesDigestToEmployer
 * ───────────────────────────────────
 * Sends ONE digest email to the employer with their top 10 matched candidates.
 *
 * @param {object} job          - the newly created job
 * @param {string} toEmail      - employer's email address
 * @param {string} toName       - employer's name / company name
 * @param {Array}  candidates   - scored+ranked candidate array (max 10)
 */
async function sendTopCandidatesDigestToEmployer(job, toEmail, toName = "", candidates = []) {
  if (!candidates.length) {
    console.log("[Netcore] No matched candidates — skipping employer digest.");
    return;
  }

  const jobTitle = job.title || job.job_title || "Your Job Post";
  const subject  = `Top ${candidates.length} Matched Candidates for "${jobTitle}"`;
  const htmlBody = buildEmployerTopCandidatesHTML(job, candidates);

  console.log(`[Netcore] Sending Top Candidates Digest to employer: ${toEmail}`);

  const result = await _sendEmail({ toEmail, toName, subject, htmlBody });

  console.log(`[Netcore] ✅ Employer digest sent to ${toEmail}:`, result);
  return result;
}

// ── Add these two to module.exports ──────────────────────────────────────────
// Make sure your final module.exports in netcore.js looks like this:
//
// module.exports = {
//   sendJobAlertToEmployee,
//   sendJobAlertToEmployees,
//   sendCandidateAlertToEmployer,
//   sendCandidateAlertToEmployers,
//   sendTopCandidatesDigestToEmployer,   // ← ADD
// };
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  sendJobAlertToEmployee,
  sendJobAlertToEmployees,
  sendCandidateAlertToEmployer,
  sendCandidateAlertToEmployers,
  sendTopCandidatesDigestToEmployer,
};