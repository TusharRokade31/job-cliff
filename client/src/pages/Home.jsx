import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBanners, getJobs, getEmployers, getCourses } from "../services/api";
import JobCard      from "../components/JobCard";
import CompanyCard  from "../components/CompanyCard";

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
      if (jobsRes.status === "fulfilled") {
        const d = jobsRes.value.data;
        setJobs(d?.data || d?.jobs || []);
      }
      if (empRes.status === "fulfilled") {
        const d = empRes.value.data;
        setCompanies(d?.data || d?.employers || []);
      }
      if (courseRes.status === "fulfilled") {
        const d = courseRes.value.data;
        setCourses(d?.data || d?.courses || []);
      }
      if (bannerRes.status === "fulfilled") {
        const d = bannerRes.value.data;
        setBanners(d?.data || d?.banners || []);
      }
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={styles.hero}>
        {/* Background grid */}
        <div style={styles.heroBg} aria-hidden />

        <div className="container" style={styles.heroInner}>
          <div style={styles.heroBadge}>
            <span className="badge badge-accent">Now Live</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Smart job matching with email alerts</span>
          </div>

          <h1 style={styles.heroTitle}>
            Your Next Role<br />
            <span style={styles.heroAccent}>Is One Click Away</span>
          </h1>

          <p style={styles.heroSub}>
            Thousands of jobs. Personalised alerts. Apply in seconds.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies…"
              style={styles.searchInput}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
              Search Jobs
            </button>
          </form>

          <div style={styles.heroStats}>
            {[["10K+", "Active Jobs"], ["5K+", "Companies"], ["50K+", "Candidates"]].map(([n, l]) => (
              <div key={l} style={styles.statItem}>
                <span style={styles.statNum}>{n}</span>
                <span style={styles.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's New Banners ─────────────────────────────── */}
      {banners.length > 0 && (
        <section style={styles.section}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">What's New</h2>
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
              {banners.map((b, i) => (
                <div key={i} style={styles.bannerCard}>
                  {b.image && <img src={b.image} alt={b.title} style={styles.bannerImg} />}
                  <p style={styles.bannerTitle}>{b.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recommended Jobs ──────────────────────────────── */}
      <section style={styles.section}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recommended Jobs</h2>
            <Link to="/jobs" className="section-link">View all →</Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state"><h3>No jobs found</h3><p>Check back soon.</p></div>
          ) : (
            <div style={styles.jobGrid}>
              {jobs.map((job) => <JobCard key={job._id || job.id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Companies ─────────────────────────────────────── */}
      <section style={{ ...styles.section, background: "var(--bg-card)", padding: "60px 0" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Companies</h2>
            <Link to="/employers" className="section-link">See all →</Link>
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : (
            <div style={styles.companyGrid}>
              {companies.map((c) => <CompanyCard key={c._id || c.id} company={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Courses ───────────────────────────────────────── */}
      {courses.length > 0 && (
        <section style={styles.section}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Placement Courses</h2>
            </div>
            <div style={styles.courseGrid}>
              {courses.map((c) => (
                <div key={c._id || c.id} className="card" style={styles.courseCard}>
                  <span className="badge badge-purple" style={{ marginBottom: 10 }}>
                    {c.course_type || "Course"}
                  </span>
                  <h4 style={styles.courseTitle}>{c.title || c.course_name}</h4>
                  <p  style={styles.courseSub}>{c.instructor_name || c.instructor}</p>
                  {c.price != null && (
                    <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.95rem", marginTop: "auto" }}>
                      ₹{c.price}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section style={styles.ctaSection}>
        <div className="container" style={styles.ctaInner}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800 }}>
              Hiring top talent?
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
              Post a job and get instant email alerts to matching candidates.
            </p>
          </div>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: "1rem", padding: "12px 28px" }}>
            Post a Job Free
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles = {
  hero: { position: "relative", padding: "100px 0 80px", overflow: "hidden" },
  heroBg: {
    position: "absolute", inset: 0, zIndex: 0,
    background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,53,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroInner: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 24 },
  heroBadge: { display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 99, padding: "6px 16px" },
  heroTitle: { fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem,6vw,4rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" },
  heroAccent: { color: "var(--accent)" },
  heroSub: { fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: 480 },
  searchForm: { display: "flex", gap: 10, width: "100%", maxWidth: 560, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "6px 6px 6px 16px" },
  searchInput: { flex: 1, background: "none", border: "none", color: "var(--text-primary)", fontSize: "0.95rem", minWidth: 0 },
  heroStats: { display: "flex", gap: 40, marginTop: 8 },
  statItem:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statNum:   { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--text-primary)" },
  statLabel: { fontSize: "0.78rem", color: "var(--text-muted)" },
  section:   { padding: "60px 0" },
  bannerCard:{ flexShrink: 0, width: 260, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" },
  bannerImg: { width: "100%", height: 120, objectFit: "cover" },
  bannerTitle:{ padding: "10px 14px", fontSize: "0.85rem", fontWeight: 600 },
  jobGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 },
  companyGrid:{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 },
  courseGrid:{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 },
  courseCard:{ padding: 20, display: "flex", flexDirection: "column", gap: 6, minHeight: 160 },
  courseTitle:{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" },
  courseSub: { fontSize: "0.8rem", color: "var(--text-muted)" },
  ctaSection:{ background: "linear-gradient(135deg, var(--accent-dim) 0%, var(--accent-2-dim) 100%)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", margin: "0 24px 80px", padding: "48px 40px" },
  ctaInner:  { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, maxWidth: 1200, margin: "0 auto" },
};
