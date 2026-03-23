import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerEmployee, registerEmployer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [tab,      setTab]     = useState("employee");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");

  // Employee fields
  const [empForm, setEmpForm] = useState({ name: "", email: "", password: "", mobile: "", job_title: "", skills: "" });

  // Employer fields
  const [emplorForm, setEmplorForm] = useState({ name: "", email: "", password: "", mobile: "", company_name: "", industry: "" });

  const { login } = useAuth();
  const navigate  = useNavigate();

  const updateEmp   = (k, v) => setEmpForm(p => ({ ...p, [k]: v }));
  const updateEmplor = (k, v) => setEmplorForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (tab === "employee") {
        // Convert skills string → array for API + matching service
        const body = {
          ...empForm,
          skills: empForm.skills.split(",").map(s => s.trim()).filter(Boolean),
        };
        const { data } = await registerEmployee(body);
        setSuccess("Account created! Matching employers have been notified. Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user  = data?.data?.user || data?.user || data?.data || body;
          if (token) { login(user, "employee", token); navigate("/"); }
          else navigate("/login");
        }, 2000);
      } else {
        const { data } = await registerEmployer(emplorForm);
        setSuccess("Employer account created! Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user  = data?.data || emplorForm;
          if (token) { login(user, "employer", token); navigate("/"); }
          else navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}><span style={{ color: "var(--accent)" }}>Job</span>Cliff</Link>
        <h1 style={styles.heading}>Create Account</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["employee", "employer"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t === "employee" ? "👤 Job Seeker" : "🏢 Employer"}
            </button>
          ))}
        </div>

        {/* Netcore note */}
        <div style={styles.infoBox}>
          {tab === "employee"
            ? "📧 After sign-up, matching employers will be emailed about your profile automatically."
            : "📧 When you post a job, matching candidates will receive an email alert automatically."}
        </div>

        {error   && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {tab === "employee" ? (
            <>
              <div style={styles.row}>
                <Field label="Full Name"   value={empForm.name}       onChange={v => updateEmp("name", v)}       placeholder="John Doe"        required />
                <Field label="Mobile"      value={empForm.mobile}     onChange={v => updateEmp("mobile", v)}     placeholder="+91 9876543210" />
              </div>
              <Field label="Email"          value={empForm.email}      onChange={v => updateEmp("email", v)}      placeholder="you@email.com"   type="email" required />
              <Field label="Password"       value={empForm.password}   onChange={v => updateEmp("password", v)}   placeholder="Min 8 characters" type="password" required />
              <Field label="Desired Job Title" value={empForm.job_title} onChange={v => updateEmp("job_title", v)} placeholder="Frontend Developer" />
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Skills <span style={styles.hint}>(comma separated)</span></label>
                <input
                  value={empForm.skills}
                  onChange={(e) => updateEmp("skills", e.target.value)}
                  placeholder="React, Node.js, Python…"
                  style={styles.input}
                />
              </div>
            </>
          ) : (
            <>
              <div style={styles.row}>
                <Field label="Contact Name"   value={emplorForm.name}         onChange={v => updateEmplor("name", v)}         placeholder="Jane Smith" required />
                <Field label="Mobile"         value={emplorForm.mobile}       onChange={v => updateEmplor("mobile", v)}       placeholder="+91 9876543210" />
              </div>
              <Field label="Email"            value={emplorForm.email}        onChange={v => updateEmplor("email", v)}        placeholder="hr@company.com" type="email" required />
              <Field label="Password"         value={emplorForm.password}     onChange={v => updateEmplor("password", v)}     placeholder="Min 8 characters" type="password" required />
              <Field label="Company Name"     value={emplorForm.company_name} onChange={v => updateEmplor("company_name", v)} placeholder="Acme Corp" required />
              <Field label="Industry"         value={emplorForm.industry}     onChange={v => updateEmplor("industry", v)}     placeholder="Technology, Finance…" />
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem", marginTop: 6 }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

// Reusable field subcomponent
function Field({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  page:   { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  card:   { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "36px 32px", width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 },
  logo:   { fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, textAlign: "center" },
  heading:{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, textAlign: "center" },
  tabs:   { display: "flex", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: 4, gap: 4 },
  tab:    { flex: 1, padding: "8px", borderRadius: 6, border: "none", background: "none", color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "var(--transition)" },
  tabActive: { background: "var(--bg-card)", color: "var(--text-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  infoBox: { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.8rem", color: "#a78bfa" },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.82rem" },
  successBox:{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.82rem" },
  form:   { display: "flex", flexDirection: "column", gap: 12 },
  row:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldWrap:{ display: "flex", flexDirection: "column", gap: 6 },
  label:  { fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" },
  hint:   { fontWeight: 400, color: "var(--text-muted)" },
  input:  { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--text-primary)", fontSize: "0.88rem", transition: "var(--transition)" },
  footer: { textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" },
};
