/**
 * pages/PostJob.jsx
 * ─────────────────────────────────────────────────────────────
 * Employer-only page to post a new job.
 *
 * On submit it calls POST /api/jobs/create which:
 *   1. Creates the job on Job Cliff backend
 *   2. Finds matching candidates (title + skills)
 *   3. Emails each matched candidate (job alert)
 *   4. Emails the employer a top-10 candidate digest
 *
 * Payload fields match exactly what the Job Cliff backend expects
 * (verified from the network screenshot):
 *   job_title, job_type, job_date, duration, salary, apply_by,
 *   min_experience, num_openings, job_location, about_job,
 *   job_latitude, job_longitude, skills_required (JSON string),
 *   certifications_in_skills (JSON string), who_can_apply,
 *   perks (JSON string), assessment_questions, alt_mobile, locationProper
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createJob } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TagInput from "../components/TagInput";

// ── Helpers ────────────────────────────────────────────────────
const wrap = (txt) => txt ? `<p>${txt}</p>` : "";

// ── Default form values (mirrors the HTML e2e tester defaults) ─
const DEFAULT_FORM = {
  job_title:            "React Developer Intern",
  job_type:             "Internship",
  job_date:             "Within 1 Month",
  duration:             "6 Months",
  salary:               "40,000 - 60,000 /Month",
  apply_by:             "2025-12-31",
  min_experience:       "3 Years",
  num_openings:         "5",
  job_location:         "Work From Home",
  locationProper:       "Mumbai, Maharashtra",
  job_latitude:         "19.076090",
  job_longitude:        "72.877426",
  about_job:            "We are looking for a passionate React Developer Intern to join our team. You will work on real projects and gain hands-on experience.",
  who_can_apply:        "Students or freshers with a basic understanding of React and JavaScript can apply.",
  assessment_questions: "Why do you want this internship?",
  alt_mobile:           "",
};

const DEFAULT_SKILLS = ["React", "JavaScript", "Node.js"];
const DEFAULT_CERTS  = [];
const DEFAULT_PERKS  = ["Work from home", "Certificate of Completion"];

// ── Field wrapper ──────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="text-xs text-gray-400 font-normal ml-2">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all bg-white";
const selectCls = inputCls;

// ── Section heading ────────────────────────────────────────────
function SectionHead({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="font-display font-bold text-lg text-navy-700">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function PostJob() {
  const { isLoggedIn, userType, token } = useAuth();
  const navigate = useNavigate();

  // ── Form State (pre-populated with defaults) ────────────────
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [skills,  setSkills]  = useState([...DEFAULT_SKILLS]);
  const [certs,   setCerts]   = useState([...DEFAULT_CERTS]);
  const [perks,   setPerks]   = useState([...DEFAULT_PERKS]);

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Guard: employer only ────────────────────────────────────
  if (!isLoggedIn || userType !== "employer") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">🔒</div>
        <h2 className="font-display font-bold text-2xl text-navy-700">Employers Only</h2>
        <p className="text-gray-500 max-w-sm">You need to be logged in as an employer to post a job.</p>
        <div className="flex gap-3 mt-2">
          <Link to="/login"    className="px-6 py-2.5 bg-navy-700 text-white rounded-full text-sm font-semibold hover:bg-navy-800 transition-all">Login</Link>
          <Link to="/register" className="px-6 py-2.5 border border-navy-700 text-navy-700 rounded-full text-sm font-semibold hover:bg-blue-50 transition-all">Register as Employer</Link>
        </div>
      </div>
    );
  }

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skills.length) { setError("Please add at least one required skill."); return; }

    setLoading(true);
    setError("");

    const body = {
      ...form,
      num_openings:             parseInt(form.num_openings) || 1,
      job_latitude:             parseFloat(form.job_latitude)  || 0,
      job_longitude:            parseFloat(form.job_longitude) || 0,
      about_job:                wrap(form.about_job),
      who_can_apply:            wrap(form.who_can_apply),
      assessment_questions:     wrap(form.assessment_questions),
      // Backend expects JSON-stringified arrays for these three
      skills_required:          JSON.stringify(skills),
      certifications_in_skills: JSON.stringify(certs),
      perks:                    JSON.stringify(perks),
    };

    try {
      await createJob(body);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err?.response?.data?.upstream?.message ||
        err?.response?.data?.message ||
        "Failed to post job. Please try again.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setLoading(false);
  };

  // ── Reset helper ────────────────────────────────────────────
  const resetForm = () => {
    setSuccess(false);
    setForm({ ...DEFAULT_FORM });
    setSkills([...DEFAULT_SKILLS]);
    setCerts([...DEFAULT_CERTS]);
    setPerks([...DEFAULT_PERKS]);
  };

  // ── Success screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">✅</div>
        <div>
          <h2 className="font-display font-bold text-2xl text-navy-700 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-500 max-w-md">
            Matching candidates are being notified by email right now. You'll also receive a digest of
            the top-10 matched candidates in your inbox shortly.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3 text-sm text-purple-700 max-w-sm">
          📋 Check your server terminal for <code className="font-mono bg-purple-100 px-1 rounded">[Netcore]</code> logs to confirm email delivery.
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={resetForm}
            className="px-6 py-2.5 bg-brand-green text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all"
          >
            Post Another Job
          </button>
          <Link to="/jobs" className="px-6 py-2.5 border border-navy-700 text-navy-700 rounded-full text-sm font-semibold hover:bg-blue-50 transition-all">
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy-lt to-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-3xl text-navy-700">Post a Job</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Matching candidates will be automatically emailed when you submit.
          </p>
        </div>

        {/* Email trigger notice */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3.5 flex items-start gap-3 mb-6 text-sm text-purple-800">
          <span className="text-lg mt-0.5">📧</span>
          <div>
            <strong>Automatic email alerts</strong> — as soon as you post, our system finds job seekers whose
            title and skills match, emails them instantly, and sends <em>you</em> a ranked digest of the
            top-10 matched candidates.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── SECTION 1: Basic Info ── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
            <SectionHead title="Basic Details" subtitle="Core job information shown to candidates" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field label="Job Title" required>
                <input className={inputCls} placeholder="e.g. React Developer Intern" required
                  value={form.job_title} onChange={e => set("job_title", e.target.value)} />
              </Field>

              <Field label="Job Type" required>
                <select className={selectCls} required value={form.job_type} onChange={e => set("job_type", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Freelance</option>
                  <option>Contract</option>
                </select>
              </Field>

              <Field label="Job Date">
                <select className={selectCls} value={form.job_date} onChange={e => set("job_date", e.target.value)}>
                  <option>Within 1 Month</option>
                  <option>Within 3 Months</option>
                  <option>Immediate</option>
                </select>
              </Field>

              <Field label="Duration">
                <select className={selectCls} value={form.duration} onChange={e => set("duration", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>Permanent</option>
                </select>
              </Field>

              <Field label="Salary">
                <select className={selectCls} value={form.salary} onChange={e => set("salary", e.target.value)}>
                  <option value="">— Select —</option>
                  <option value="10,000 - 20,000 /Month">₹10,000 – 20,000 /Month</option>
                  <option value="20,000 - 40,000 /Month">₹20,000 – 40,000 /Month</option>
                  <option value="40,000 - 60,000 /Month">₹40,000 – 60,000 /Month</option>
                  <option value="60,000 - 80,000 /Month">₹60,000 – 80,000 /Month</option>
                  <option value="80,000 - 1,00,000 /Month">₹80,000 – 1,00,000 /Month</option>
                  <option value="1,00,000+ /Month">₹1,00,000+ /Month</option>
                </select>
              </Field>

              <Field label="Apply By">
                <input type="date" className={inputCls}
                  value={form.apply_by} onChange={e => set("apply_by", e.target.value)} />
              </Field>

              <Field label="Minimum Experience">
                <select className={selectCls} value={form.min_experience} onChange={e => set("min_experience", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Fresher</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                  <option>5+ Years</option>
                </select>
              </Field>

              <Field label="Number of Openings">
                <input type="number" className={inputCls} min="1" placeholder="5"
                  value={form.num_openings} onChange={e => set("num_openings", e.target.value)} />
              </Field>

            </div>
          </div>

          {/* ── SECTION 2: Location ── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
            <SectionHead title="Location" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field label="Job Location">
                <select className={selectCls} value={form.job_location} onChange={e => set("job_location", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Work From Home</option>
                  <option>Mumbai</option>
                  <option>Pune</option>
                  <option>Bangalore</option>
                  <option>Delhi</option>
                  <option>Hybrid</option>
                </select>
              </Field>

              <Field label="Location Name" hint="Shown on the listing">
                <input className={inputCls} placeholder="e.g. Andheri, Mumbai"
                  value={form.locationProper} onChange={e => set("locationProper", e.target.value)} />
              </Field>

              <Field label="Latitude" hint="For map pin">
                <input className={inputCls} placeholder="19.076090"
                  value={form.job_latitude} onChange={e => set("job_latitude", e.target.value)} />
              </Field>

              <Field label="Longitude">
                <input className={inputCls} placeholder="72.877426"
                  value={form.job_longitude} onChange={e => set("job_longitude", e.target.value)} />
              </Field>

            </div>
          </div>

          {/* ── SECTION 3: Skills & Requirements ── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
            <SectionHead
              title="Skills & Requirements"
              subtitle="Used to match and email relevant candidates automatically"
            />
            <div className="flex flex-col gap-5">

              <Field label="Skills Required" required hint="Press Enter or comma to add">
                <TagInput tags={skills} onChange={setSkills} placeholder="e.g. React, Node.js" color="green" />
                {skills.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Skills are used for candidate matching — add at least one.</p>
                )}
              </Field>

              <Field label="Certifications in Skills" hint="Optional — Press Enter to add">
                <TagInput tags={certs} onChange={setCerts} placeholder="e.g. AWS Certified, Google Analytics" color="blue" />
              </Field>

              <Field label="Perks" hint="Press Enter to add">
                <TagInput tags={perks} onChange={setPerks} placeholder="e.g. Work from home, Certificate of Completion" color="orange" />
              </Field>

            </div>
          </div>

          {/* ── SECTION 4: Job Details ── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
            <SectionHead title="Job Details" />
            <div className="flex flex-col gap-5">

              <Field label="About this Job">
                <textarea className={`${inputCls} resize-y min-h-[100px]`} rows={4}
                  placeholder="Describe the role, responsibilities, company culture…"
                  value={form.about_job} onChange={e => set("about_job", e.target.value)} />
              </Field>

              <Field label="Who Can Apply">
                <textarea className={`${inputCls} resize-y min-h-[80px]`} rows={3}
                  placeholder="e.g. Freshers, students with basic JS knowledge…"
                  value={form.who_can_apply} onChange={e => set("who_can_apply", e.target.value)} />
              </Field>

              <Field label="Assessment Questions" hint="Optional screening questions">
                <textarea className={`${inputCls} resize-y min-h-[80px]`} rows={3}
                  placeholder="e.g. Why do you want this role? What's your availability?"
                  value={form.assessment_questions} onChange={e => set("assessment_questions", e.target.value)} />
              </Field>

              <Field label="Alternate Mobile for Calling & Confirmation">
                <input className={inputCls} placeholder="10-digit mobile number" maxLength={10}
                  value={form.alt_mobile} onChange={e => set("alt_mobile", e.target.value.replace(/\D/g, ""))} />
              </Field>

            </div>
          </div>

          {/* ── Submit ── */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
            <div className="flex items-start gap-3 mb-5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800">
              <span className="text-base mt-0.5">🚀</span>
              <span>
                Once posted, matching candidates receive a <strong>job alert email</strong> and you receive
                a <strong>top-10 candidate digest</strong> — all automatically within seconds.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !skills.length}
              className="w-full py-3.5 bg-navy-700 text-white font-display font-bold text-base rounded-xl hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting &amp; sending alerts…
                </>
              ) : (
                "📢 Post Job & Trigger Email Alerts"
              )}
            </button>

            {!skills.length && (
              <p className="text-xs text-center text-red-500 mt-2">Add at least one skill to enable posting</p>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}