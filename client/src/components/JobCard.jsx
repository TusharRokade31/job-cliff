import { useState } from "react";
import { Link } from "react-router-dom";
import { saveJob, unsaveJob } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobCard({ job }) {
  const { isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(job.is_saved || false);
  const [saving, setSaving] = useState(false);

  const id       = job._id || job.id;
  const title    = job.title || job.job_title || "Untitled Role";
  const company  = job.company_name || job.employer_name || "Company";
  const location = job.job_location || job.location || "Remote";
  const type     = job.job_type || job.employment_type || "Full-time";
  const skills   = Array.isArray(job.skills) ? job.skills.slice(0, 3) : [];
  const salary   = job.salary_range || job.salary || null;
  const posted   = job.created_at ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
  const logo     = job.company_logo || job.logo || null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || saving) return;
    setSaving(true);
    try {
      if (saved) { await unsaveJob(id); setSaved(false); }
      else        { await saveJob(id);   setSaved(true);  }
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <Link to={`/jobs/${id}`} style={{ display: "block", textDecoration: "none" }}>
      <div className="card" style={styles.card}>
        {/* Top row */}
        <div style={styles.top}>
          <div style={styles.logoWrap}>
            {logo
              ? <img src={logo} alt={company} style={styles.logo} />
              : <span style={styles.logoFallback}>{company[0]}</span>
            }
          </div>
          <div style={styles.meta}>
            <span className="badge badge-accent">{type}</span>
            {posted && <span style={styles.date}>{posted}</span>}
          </div>
        </div>

        {/* Title + company */}
        <h3 style={styles.title}>{title}</h3>
        <p  style={styles.company}>{company}</p>

        {/* Location + salary */}
        <div style={styles.row}>
          <span style={styles.chip}>📍 {location}</span>
          {salary && <span style={styles.chip}>💰 {salary}</span>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={styles.skills}>
            {skills.map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.applyLink}>View Details →</span>
          {isLoggedIn && (
            <button
              onClick={handleSave}
              style={{ ...styles.saveBtn, color: saved ? "var(--accent)" : "var(--text-muted)" }}
              title={saved ? "Unsave" : "Save job"}
            >
              {saved ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: { padding: 20, display: "flex", flexDirection: "column", gap: 10, height: "100%" },
  top:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  logoWrap: {
    width: 44, height: 44,
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logo: { width: "100%", height: "100%", objectFit: "cover" },
  logoFallback: {
    fontFamily: "var(--font-display)",
    fontWeight: 700, fontSize: "1.1rem",
    color: "var(--accent)",
  },
  meta: { display: "flex", gap: 8, alignItems: "center" },
  date: { fontSize: "0.75rem", color: "var(--text-muted)" },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "1rem", fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.3,
  },
  company: { fontSize: "0.875rem", color: "var(--text-secondary)" },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    fontSize: "0.78rem", color: "var(--text-secondary)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 99, padding: "3px 10px",
  },
  skills: { display: "flex", gap: 6, flexWrap: "wrap" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--border)" },
  applyLink: { fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 },
  saveBtn: { background: "none", border: "none", fontSize: "1.2rem", padding: "4px 8px", transition: "var(--transition)" },
};
