import { Link } from "react-router-dom";

export default function CompanyCard({ company }) {
  const id      = company._id || company.id;
  const name    = company.company_name || company.name || "Company";
  const industry= company.industry || "";
  const city    = company.city || company.location || "";
  const logo    = company.logo || company.company_logo || null;
  const jobs    = company.total_jobs ?? company.job_count ?? null;

  return (
    <Link to={`/employers/${id}`} style={{ display: "block", textDecoration: "none" }}>
      <div className="card" style={styles.card}>
        <div style={styles.logoWrap}>
          {logo
            ? <img src={logo} alt={name} style={styles.logo} />
            : <span style={styles.logoFallback}>{name[0]}</span>
          }
        </div>
        <h4 style={styles.name}>{name}</h4>
        {industry && <p style={styles.sub}>{industry}</p>}
        <div style={styles.footer}>
          {city  && <span style={styles.chip}>📍 {city}</span>}
          {jobs != null && <span style={styles.chip}>💼 {jobs} jobs</span>}
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: { padding: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center" },
  logoWrap: {
    width: 56, height: 56, borderRadius: "var(--radius-md)",
    background: "var(--bg-elevated)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  logo: { width: "100%", height: "100%", objectFit: "cover" },
  logoFallback: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "var(--accent)" },
  name: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" },
  sub:  { fontSize: "0.78rem", color: "var(--text-muted)" },
  footer: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  chip:   { fontSize: "0.72rem", color: "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 99, padding: "2px 8px" },
};
