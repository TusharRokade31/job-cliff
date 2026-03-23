import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginEmployee, loginEmployer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [tab,      setTab]      = useState("employee"); // "employee" | "employer"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const fn = tab === "employee" ? loginEmployee : loginEmployer;
      const { data } = await fn({ email, password });

      const token = data?.token || data?.data?.token;
      const user  = data?.data?.user || data?.user || data?.data || {};
      login(user, tab, token);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logo}><span style={{ color: "var(--accent)" }}>Job</span>Cliff</Link>
        <h1 style={styles.heading}>Welcome back</h1>
        <p  style={styles.sub}>Log in to your account</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["employee", "employer"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
              {t === "employee" ? "👤 Job Seeker" : "🏢 Employer"}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" value={password} required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          <Link to="/forgot-password" style={styles.forgot}>Forgot password?</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:   { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  card:   { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "40px 36px", width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 },
  logo:   { fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, textAlign: "center" },
  heading:{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, textAlign: "center" },
  sub:    { color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", marginTop: -8 },
  tabs:   { display: "flex", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: 4, gap: 4 },
  tab:    { flex: 1, padding: "8px", borderRadius: 6, border: "none", background: "none", color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "var(--transition)" },
  tabActive: { background: "var(--bg-card)", color: "var(--text-primary)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  error:  { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.82rem" },
  form:   { display: "flex", flexDirection: "column", gap: 14 },
  field:  { display: "flex", flexDirection: "column", gap: 6 },
  label:  { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" },
  input:  { background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px", color: "var(--text-primary)", fontSize: "0.9rem", transition: "var(--transition)" },
  forgot: { fontSize: "0.78rem", color: "var(--accent)", textAlign: "right", marginTop: -6 },
  footer: { textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 },
};
