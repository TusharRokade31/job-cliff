import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBanners, getJobs, getEmployers, getCourses } from "../services/api";
import JobCard     from "../components/JobCard";
import CompanyCard from "../components/CompanyCard";

export default function Home() {
  const [search,    setSearch]    = useState("");
  const [jobs,      setJobs]      = useState([]);
  const [companies, setCompanies] = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [banners,   setBanners]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      getJobs({ page: 1, limit: 6 }),
      getEmployers({ page: 1, limit: 6 }),
      getCourses({ limit: 3 }),
      getBanners(),
    ]).then(([jobsRes, empRes, courseRes, bannerRes]) => {
      if (jobsRes.status   === "fulfilled") { const d = jobsRes.value.data;   setJobs(d?.data || d?.jobs || []); }
      if (empRes.status    === "fulfilled") { const d = empRes.value.data;    setCompanies(d?.data || d?.employers || []); }
      if (courseRes.status === "fulfilled") { const d = courseRes.value.data; setCourses(d?.data || d?.courses || []); }
      if (bannerRes.status === "fulfilled") { const d = bannerRes.value.data; setBanners(d?.data || d?.banners || []); }
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #0D2B6E 0%, #1A6BBF 100%)",
        padding: "96px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, background: "rgba(59,171,53,0.08)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 320, height: 320, background: "rgba(255,255,255,0.04)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, padding: "6px 18px", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3BAB35", display: "inline-block" }} />
            Smart job matching · Free for candidates
          </div>

          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "#fff", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Your Next Role Is<br />
            <span style={{ color: "#3BAB35" }}>One Click Away</span>
          </h1>

          <p style={{ color: "#93c5fd", fontSize: "1.1rem", maxWidth: 440, lineHeight: 1.6 }}>
            Thousands of jobs. Personalised alerts. Apply in seconds.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 560, background: "#fff", borderRadius: 16, padding: "6px 6px 6px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies…"
              style={{ flex: 1, border: "none", background: "transparent", fontSize: "0.95rem", color: "#1a2340", outline: "none", minWidth: 0 }}
            />
            <button type="submit" style={{ background: "#3BAB35", color: "#fff", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.875rem", border: "none", borderRadius: 10, padding: "10px 22px", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(59,171,53,0.3)" }}>
              Search Jobs
            </button>
          </form>

          {/* Stats */}
          <div style={{ display: "flex", gap: 48, marginTop: 8 }}>
            {[["10K+", "Active Jobs"], ["5K+", "Companies"], ["50K+", "Candidates"]].map(([n, l]) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#fff" }}>{n}</span>
                <span style={{ fontSize: "0.75rem", color: "#93c5fd" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Banners ───────────────────────────────────── */}
      {banners.length > 0 && (
        <Section title="What's New">
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {banners.map((b, i) => (
              <div key={i} style={{ flexShrink: 0, width: 260, background: "#fff", border: "1px solid #e2eaf8", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(13,43,110,0.06)" }}>
                {b.image && <img src={b.image} alt={b.title} style={{ width: "100%", height: 120, objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
                <p style={{ padding: "10px 14px", fontSize: "0.85rem", fontWeight: 600, color: "#0D2B6E" }}>{b.title}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Recommended Jobs ─────────────────────────── */}
      <Section title="Recommended Jobs" linkTo="/jobs" linkText="View all →">
        {loading ? <Loader /> : jobs.length === 0 ? <Empty title="No jobs found" sub="Check back soon." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
            {jobs.map((job) => <JobCard key={job._id || job.id} job={job} />)}
          </div>
        )}
      </Section>

      {/* ── Top Companies ────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #e2eaf8", borderBottom: "1px solid #e2eaf8" }}>
        <Section title="Top Companies" linkTo="/employers" linkText="See all →">
          {loading ? <Loader /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 16 }}>
              {companies.map((c) => <CompanyCard key={c._id || c.id} company={c} />)}
            </div>
          )}
        </Section>
      </div>

      {/* ── Courses ───────────────────────────────────── */}
      {courses.length > 0 && (
        <Section title="Placement Courses">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 }}>
            {courses.map((c) => (
              <div key={c._id || c.id} style={{ background: "#fff", border: "1px solid #e2eaf8", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 8, minHeight: 160, boxShadow: "0 2px 12px rgba(13,43,110,0.06)" }}>
                <span style={{ background: "#f3e8ff", color: "#7c3aed", border: "1px solid #e9d5ff", borderRadius: 99, padding: "2px 12px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: "fit-content" }}>
                  {c.course_type || "Live Session"}
                </span>
                <h4 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#0D2B6E", lineHeight: 1.4 }}>
                  {c.title || c.course_name}
                </h4>
                {c.instructor_name && <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{c.instructor_name}</p>}
                {c.price != null && (
                  <p style={{ color: "#3BAB35", fontWeight: 700, fontSize: "1rem", marginTop: "auto" }}>₹{c.price}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── CTA Banner ───────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ background: "linear-gradient(135deg, #0D2B6E 0%, #1A6BBF 100%)", borderRadius: 24, padding: "48px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#fff" }}>
              Hiring top talent?
            </h2>
            <p style={{ color: "#93c5fd", marginTop: 8, fontSize: "0.95rem" }}>
              Post a job and get instant email alerts to matching candidates.
            </p>
          </div>
          <Link to="/register" style={{ background: "#3BAB35", color: "#fff", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "1rem", padding: "14px 32px", borderRadius: 12, boxShadow: "0 4px 16px rgba(59,171,53,0.3)", whiteSpace: "nowrap" }}>
            Post a Job Free
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, linkTo, linkText, children }) {
  return (
    <div style={{ padding: "56px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#0D2B6E" }}>
            {title}
          </h2>
          {linkTo && (
            <Link to={linkTo} style={{ fontSize: "0.875rem", fontWeight: 700, color: "#3BAB35" }}>
              {linkText}
            </Link>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div className="spinner" />
    </div>
  );
}

function Empty({ title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "1.1rem", color: "#6b7280", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: "0.875rem" }}>{sub}</p>
    </div>
  );
}