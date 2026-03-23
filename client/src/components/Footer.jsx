import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "#0D2B6E", color: "#fff", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>

        {/* Brand with logo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 280 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/jobclif.webp"
              alt="JobCliff"
              style={{ height: 36, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "inline";
              }}
            />
            <span style={{ display: "none", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#fff" }}>
              job<span style={{ color: "#3BAB35" }}>cliff</span>
            </span>
          </Link>
          <p style={{ fontSize: "0.85rem", color: "#93c5fd", lineHeight: 1.6 }}>
            A Not-for-Profit initiative by Vedanta Foundation.<br />
            Find your next role. Hire the right talent.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3BAB35", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>Powered by Vedanta Foundation</span>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#93c5fd", marginBottom: 4 }}>
              For Candidates
            </p>
            <Link to="/jobs"     style={{ fontSize: "0.875rem", color: "#bfdbfe" }}>Browse Jobs</Link>
            <Link to="/register" style={{ fontSize: "0.875rem", color: "#bfdbfe" }}>Create Profile</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#93c5fd", marginBottom: 4 }}>
              For Employers
            </p>
            <Link to="/register" style={{ fontSize: "0.875rem", color: "#bfdbfe" }}>Post a Job</Link>
            <Link to="/register" style={{ fontSize: "0.875rem", color: "#bfdbfe" }}>Find Talent</Link>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "18px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "#60a5fa" }}>
          © {new Date().getFullYear()} JobCliff · Vedanta Foundation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}