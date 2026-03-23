import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.brand}>
          <span style={styles.logo}><span style={{ color: "var(--accent)" }}>Job</span>Cliff</span>
          <p style={styles.tagline}>Find your next role. Hire the right talent.</p>
        </div>
        <div style={styles.cols}>
          <div>
            <p style={styles.colHead}>For Candidates</p>
            <Link to="/jobs"     style={styles.colLink}>Browse Jobs</Link>
            <Link to="/register" style={styles.colLink}>Create Profile</Link>
          </div>
          <div>
            <p style={styles.colHead}>For Employers</p>
            <Link to="/register" style={styles.colLink}>Post a Job</Link>
            <Link to="/register" style={styles.colLink}>Find Talent</Link>
          </div>
        </div>
      </div>
      <div style={styles.bottom}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
          © {new Date().getFullYear()} Job Cliff. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: { borderTop: "1px solid var(--border)", marginTop: 80, paddingTop: 48 },
  inner:  { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, paddingBottom: 40 },
  brand:  { display: "flex", flexDirection: "column", gap: 8 },
  logo:   { fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800 },
  tagline:{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 220 },
  cols:   { display: "flex", gap: 60 },
  colHead:{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 },
  colLink:{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8, transition: "var(--transition)" },
  bottom: { borderTop: "1px solid var(--border)", padding: "20px 0", textAlign: "center" },
};
