import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById, applyToJob, saveJob, unsaveJob, getSaveStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetails() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const { isLoggedIn, userType } = useAuth();

  const [job,       setJob]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saved,     setSaved]     = useState(false);
  const [applying,  setApplying]  = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [msg,       setMsg]       = useState(null); // { type: "success"|"error", text }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getJobById(jobId);
        setJob(data?.data || data?.job || data);
      } catch { setJob(null); }
      setLoading(false);
    })();
  }, [jobId]);

  useEffect(() => {
    if (isLoggedIn && jobId) {
      getSaveStatus(jobId)
        .then(({ data }) => setSaved(data?.is_saved || false))
        .catch(() => {});
    }
  }, [isLoggedIn, jobId]);

  const handleApply = async () => {
    if (!isLoggedIn) return navigate("/login");
    setApplying(true);
    try {
      await applyToJob(jobId);
      setApplied(true);
      setMsg({ type: "success", text: "Application submitted! Good luck 🎉" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to apply. Try again." });
    }
    setApplying(false);
  };

  const handleSave = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      if (saved) { await unsaveJob(jobId); setSaved(false); }
      else        { await saveJob(jobId);   setSaved(true);  }
    } catch {}
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!job)    return (
    <div className="page-loader">
      <h3 style={{ color: "var(--text-secondary)" }}>Job not found</h3>
      <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Jobs</Link>
    </div>
  );

  const title    = job.title || job.job_title || "Untitled";
  const company  = job.company_name || job.employer_name || "Company";
  const location = job.job_location || job.location || "—";
  const type     = job.job_type || job.employment_type || "Full-time";
  const salary   = job.salary_range || job.salary || null;
  const skills   = Array.isArray(job.skills) ? job.skills : [];
  const desc     = job.description || job.job_description || "";
  const resp     = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const req      = Array.isArray(job.requirements)     ? job.requirements     : [];
  const perks    = Array.isArray(job.perks)            ? job.perks            : [];
  const logo     = job.company_logo || job.logo || null;
  const posted   = job.created_at ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <main style={{ padding: "40px 0 80px" }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={styles.crumb}>
          <Link to="/"    style={styles.crumbLink}>Home</Link> /
          <Link to="/jobs" style={styles.crumbLink}>Jobs</Link> /
          <span style={{ color: "var(--text-muted)" }}>{title}</span>
        </div>

        <div style={styles.layout}>
          {/* ── Main Content ────────────────────────────── */}
          <article style={styles.main}>
            {/* Job header */}
            <div style={styles.jobHeader}>
              <div style={styles.logoWrap}>
                {logo
                  ? <img src={logo} alt={company} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={styles.logoFallback}>{company[0]}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={styles.jobTitle}>{title}</h1>
                <p  style={styles.jobCompany}>{company}</p>
                <div style={styles.metaRow}>
                  <span style={styles.metaChip}>📍 {location}</span>
                  <span style={styles.metaChip}>⏱ {type}</span>
                  {salary && <span style={styles.metaChip}>💰 {salary}</span>}
                  {posted && <span style={styles.metaChip}>🗓 {posted}</span>}
                </div>
              </div>
            </div>

            {/* Alert message */}
            {msg && (
              <div style={{ ...styles.alert, background: msg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderColor: msg.type === "success" ? "#34d399" : "#f87171", color: msg.type === "success" ? "#34d399" : "#f87171" }}>
                {msg.text}
              </div>
            )}

            {/* Description */}
            {desc && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>About this Role</h2>
                <p style={styles.bodyText}>{desc}</p>
              </section>
            )}

            {/* Responsibilities */}
            {resp.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Responsibilities</h2>
                <ul style={styles.list}>
                  {resp.map((r, i) => <li key={i} style={styles.listItem}>{r}</li>)}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {req.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Requirements</h2>
                <ul style={styles.list}>
                  {req.map((r, i) => <li key={i} style={styles.listItem}>{r}</li>)}
                </ul>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Skills Required</h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {skills.map((s) => (
                    <span key={s} style={styles.skillTag}>{s}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Perks */}
            {perks.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Perks & Benefits</h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {perks.map((p) => (
                    <span key={p} style={{ ...styles.skillTag, background: "var(--accent-2-dim)", color: "#a78bfa", borderColor: "rgba(124,58,237,0.2)" }}>{p}</span>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sticky Sidebar CTA ──────────────────────── */}
          <aside style={styles.sidebar}>
            <div style={styles.ctaCard}>
              <p style={styles.ctaTitle}>Interested in this role?</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 20 }}>
                {isLoggedIn ? "Submit your application in one click." : "Login to apply to this job."}
              </p>

              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying || applied}
                style={{ width: "100%", justifyContent: "center", fontSize: "0.95rem", padding: "12px" }}
              >
                {applied ? "✓ Applied" : applying ? "Submitting…" : "Apply Now"}
              </button>

              <button
                className="btn btn-outline"
                onClick={handleSave}
                style={{ width: "100%", justifyContent: "center", marginTop: 10, color: saved ? "var(--accent)" : undefined }}
              >
                {saved ? "♥ Saved" : "♡ Save Job"}
              </button>

              {!isLoggedIn && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                  <Link to="/login" style={{ color: "var(--accent)" }}>Login</Link> to apply or save this job.
                </p>
              )}
            </div>

            {/* Job summary card */}
            <div style={styles.summaryCard}>
              <p style={styles.summaryTitle}>Job Summary</p>
              {[
                ["Job Type",    type],
                ["Location",    location],
                ["Salary",      salary || "Not disclosed"],
                ["Posted",      posted  || "—"],
              ].map(([label, value]) => (
                <div key={label} style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>{label}</span>
                  <span style={styles.summaryValue}>{value}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const styles = {
  crumb:     { display: "flex", gap: 8, alignItems: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 28 },
  crumbLink: { color: "var(--text-secondary)", transition: "var(--transition)" },
  layout:    { display: "flex", gap: 32, alignItems: "flex-start" },
  main:      { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 },
  jobHeader: { display: "flex", gap: 20, alignItems: "flex-start", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28, marginBottom: 28 },
  logoWrap:  { width: 64, height: 64, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  logoFallback: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "var(--accent)" },
  jobTitle:  { fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.2 },
  jobCompany:{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: 4 },
  metaRow:   { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  metaChip:  { fontSize: "0.78rem", color: "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 99, padding: "4px 12px" },
  alert:     { border: "1px solid", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: "0.875rem", marginBottom: 24 },
  section:   { borderTop: "1px solid var(--border)", paddingTop: 28, paddingBottom: 28 },
  sectionTitle: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 16 },
  bodyText:  { fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-line" },
  list:      { paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 },
  listItem:  { fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 },
  skillTag:  { display: "inline-block", padding: "5px 14px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 99, fontSize: "0.8rem", fontWeight: 500 },
  sidebar:   { width: 280, flexShrink: 0, position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 },
  ctaCard:   { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 24 },
  ctaTitle:  { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 },
  summaryCard:{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 },
  summaryTitle:{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", marginBottom: 14 },
  summaryRow:{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" },
  summaryLabel:{ fontSize: "0.78rem", color: "var(--text-muted)" },
  summaryValue:{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500, textAlign: "right", maxWidth: "60%" },
};
