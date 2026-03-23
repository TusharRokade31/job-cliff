/**
 * netcore.js
 * ──────────────────────────────────────────────────────────
 * Wrapper around the Netcore Smartech Campaign Create API.
 *
 * Netcore Campaign API Reference:
 * https://developer.netcorecloud.com/docs/create-campaign-api
 *
 * TWO campaign types are triggered from this service:
 *   1. JOB_ALERT      → fired when employer posts a job
 *                        → recipients: matched employees (by title + skills)
 *
 *   2. CANDIDATE_ALERT → fired when employee registers / updates profile
 *                        → recipients: matched employers
 * ──────────────────────────────────────────────────────────
 */

const axios = require("axios");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const NETCORE_API_URL  = process.env.NETCORE_API_URL;
const NETCORE_API_KEY  = process.env.NETCORE_API_KEY;
const SENDER_NAME      = process.env.NETCORE_SENDER_NAME;
const SENDER_EMAIL     = process.env.NETCORE_SENDER_EMAIL;
const LIST_ID          = process.env.NETCORE_LIST_ID;
const JOB_TEMPLATE     = process.env.NETCORE_JOB_ALERT_TEMPLATE_ID;
const CANDIDATE_TEMPLATE = process.env.NETCORE_CANDIDATE_ALERT_TEMPLATE_ID;

/**
 * Internal helper — fires a Netcore campaign.
 *
 * @param {object} opts
 * @param {string}   opts.campaignName   - unique campaign name string
 * @param {string}   opts.subjectLine    - email subject
 * @param {string|number} opts.templateId - Netcore template ID
 * @param {string[]} opts.listIds        - audience list IDs
 * @param {string[]} opts.tags           - campaign tags
 */
async function _triggerCampaign({ campaignName, subjectLine, templateId, listIds, tags }) {
  const payload = {
    campaign_details: [
      {
        tags,
        channel: "email",
        campaign_name: campaignName,
        schedule_time: "now",
        campaign_state: "active",           // "active" fires immediately; use "draft" for testing
        sender_details: {
          sender_name: SENDER_NAME,
          sender_email: SENDER_EMAIL,
        },
        content_details: {
          template_id: templateId,
          subject_line: subjectLine,
        },
        audience_details: {
          include_list: {
            list_ids: listIds,
          },
        },
        frequency_capping: {
          enable_frequency_capping: false,
        },
      },
    ],
  };

  const response = await axios.post(NETCORE_API_URL, payload, {
    headers: {
      "api-key": NETCORE_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
}

/**
 * sendJobAlertToEmployees
 * ────────────────────────
 * Called when an employer creates a new job post.
 * Sends an email campaign to employees whose skills/title match the job.
 *
 * @param {object} job - the newly created job object from the Job Cliff API
 * Expected fields: title, company_name, location, skills (array), _id / id
 */
async function sendJobAlertToEmployees(job) {
  const campaignName = `Job_Alert_${job.title}_${Date.now()}`;
  const subjectLine  = `New Job: ${job.title} at ${job.company_name || "a top company"}`;

  console.log(`[Netcore] Triggering JOB ALERT campaign for job: "${job.title}"`);

  const result = await _triggerCampaign({
    campaignName,
    subjectLine,
    templateId: JOB_TEMPLATE,
    listIds: [LIST_ID],               // Replace with dynamic list ID logic if needed
    tags: ["Job_Alert", "Employee"],
  });

  console.log("[Netcore] Job alert campaign response:", result);
  return result;
}

/**
 * sendCandidateAlertToEmployers
 * ──────────────────────────────
 * Called when a new employee registers OR updates their profile.
 * Sends an email campaign to employers whose open jobs match the candidate's profile.
 *
 * @param {object} candidate - employee profile from Job Cliff API
 * Expected fields: full_name, skills (array), job_title / desired_role
 */
async function sendCandidateAlertToEmployers(candidate) {
  const name         = candidate.full_name || candidate.name || "A new candidate";
  const role         = candidate.job_title || candidate.desired_role || "relevant role";
  const campaignName = `Candidate_Alert_${Date.now()}`;
  const subjectLine  = `New Candidate Available: ${name} — ${role}`;

  console.log(`[Netcore] Triggering CANDIDATE ALERT campaign for: "${name}"`);

  const result = await _triggerCampaign({
    campaignName,
    subjectLine,
    templateId: CANDIDATE_TEMPLATE,
    listIds: [LIST_ID],               // Replace with employer-specific list ID if segmented
    tags: ["Candidate_Alert", "Employer"],
  });

  console.log("[Netcore] Candidate alert campaign response:", result);
  return result;
}

module.exports = {
  sendJobAlertToEmployees,
  sendCandidateAlertToEmployers,
};
