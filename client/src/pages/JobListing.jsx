import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";

const JOB_TYPES     = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXPERIENCE    = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

export default function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(true);
  const [total,    setTotal]    = useState(0);

  // Filter state
  const [search,   setSearch]   = useState(searchParams.get("search") || "");
  const [jobType,  setJobType]  = useState("");
  const [exp,      setExp]      = useState("");
  const [location, setLocation] = useState("");

  const fetchJobs = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    try {
      const params = { page: currentPage, limit: 12 };
      if (search)   params.search   = search;
      if (jobType)  params.job_type = jobType;
      if (exp)      params.experience = exp;
      if (location) params.job_location = location;

      const { data } = await getJobs(params);
      const fetched = data?.data || data?.jobs || [];
      const tot     = data?.total || fetched.length;

      setTotal(tot);
      setJobs(reset ? fetched : (prev) => [...prev, ...fetched]);
      setHasMore(fetched.length === 12);
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, search, jobType, exp, location]);

  // Initial load & filter change
  useEffect(() => { fetchJobs(true); }, [search, jobType, exp, location]);

  // Load more
  useEffect(() => {
    if (page > 1) fetchJobs(false);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchJobs(true);
  };

  const clearFilters = () => { setJobType(""); setExp(""); setLocation(""); setSearch(""); };

  const activeFilters = [jobType, exp, location].filter(Boolean).length;

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* ── Page Header ───────────────────────────────────── */}
      <div style={styles.pageHeader}>
        <div className="container">
          <h1 style={styles.pageTitle}>Browse Jobs</h1>
          <p style={styles.pageSub}>{total > 0 ? `${total.toLocaleString()} opportunities found` : "Searching…"}</p>

          <form onSubmit={handleSearch} style={styles.searchRow}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skills, keywords…"
              style={styles.searchInput}
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Remote"
              style={{ ...styles.searchInput, maxWidth: 200 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container" style={styles.layout}>
        {/* ── Sidebar Filters ─────────────────────────────── */}
        <aside style={styles.sidebar}>
          <div style={styles.filterHeader}>
            <span style={styles.filterTitle}>Filters</span>
            {activeFilters > 0 && (
              <button onClick={clearFilters} style={styles.clearBtn}>
                Clear all ({activeFilters})
              </button>
            )}
          </div>

          {/* Job Type */}
          <div style={styles.filterGroup}>
            <p style={styles.filterGroupTitle}>Job Type</p>
            {JOB_TYPES.map((t) => (
              <label key={t} style={styles.filterLabel}>
                <input
                  type="radio"
                  name="jobType"
                  value={t}
                  checked={jobType === t}
                  onChange={() => setJobType(t === jobType ? "" : t)}
                  style={styles.radio}
                />
                {t}
              </label>
            ))}
          </div>

          {/* Experience */}
          <div style={styles.filterGroup}>
            <p style={styles.filterGroupTitle}>Experience</p>
            {EXPERIENCE.map((e) => (
              <label key={e} style={styles.filterLabel}>
                <input
                  type="radio"
                  name="exp"
                  value={e}
                  checked={exp === e}
                  onChange={() => setExp(e === exp ? "" : e)}
                  style={styles.radio}
                />
                {e}
              </label>
            ))}
          </div>
        </aside>

        {/* ── Job Grid ──────────────────────────────────────── */}
        <section style={{ flex: 1, minWidth: 0 }}>
          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div style={styles.activeFilters}>
              {[jobType, exp, location].filter(Boolean).map((f) => (
                <span key={f} style={styles.filterChip}>
                  {f}
                  <button onClick={() => {
                    if (f === jobType)  setJobType("");
                    if (f === exp)      setExp("");
                    if (f === location) setLocation("");
                  }} style={styles.chipRemove}>✕</button>
                </span>
              ))}
            </div>
          )}

          {loading && jobs.length === 0 ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                {jobs.map((job) => <JobCard key={job._id || job.id} job={job} />)}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 32 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    style={{ minWidth: 160 }}
                  >
                    {loading ? "Loading…" : "Load More Jobs"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const styles = {
  pageHeader: {
    background: "linear-gradient(180deg, rgba(255,107,53,0.06) 0%, transparent 100%)",
    borderBottom: "1px solid var(--border)",
    padding: "48px 0 36px",
  },
  pageTitle: { fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800 },
  pageSub:   { color: "var(--text-secondary)", marginTop: 6, marginBottom: 24 },
  searchRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  searchInput: {
    flex: 1, minWidth: 200,
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)", padding: "10px 16px",
    color: "var(--text-primary)", fontSize: "0.9rem",
  },
  layout:  { display: "flex", gap: 32, padding: "40px 24px", alignItems: "flex-start" },
  sidebar: {
    width: 220, flexShrink: 0, position: "sticky", top: 80,
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: 20,
    display: "flex", flexDirection: "column", gap: 20,
  },
  filterHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  filterTitle:  { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem" },
  clearBtn:     { background: "none", border: "none", color: "var(--accent)", fontSize: "0.78rem", cursor: "pointer" },
  filterGroup:  { display: "flex", flexDirection: "column", gap: 10 },
  filterGroupTitle: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 },
  filterLabel:  { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "var(--text-secondary)", cursor: "pointer" },
  radio:        { accentColor: "var(--accent)" },
  activeFilters:{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  filterChip:   {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "var(--accent-dim)", color: "var(--accent)",
    border: "1px solid rgba(255,107,53,0.25)",
    borderRadius: 99, padding: "4px 12px", fontSize: "0.8rem",
  },
  chipRemove: { background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, fontSize: "0.7rem" },
  grid:       { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 },
};
