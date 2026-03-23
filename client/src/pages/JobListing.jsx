import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";

const JOB_TYPES  = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

export default function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total,   setTotal]   = useState(0);

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

  useEffect(() => { fetchJobs(true); }, [search, jobType, exp, location]);
  useEffect(() => { if (page > 1) fetchJobs(false); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchJobs(true);
  };

  const clearFilters = () => { setJobType(""); setExp(""); setLocation(""); setSearch(""); };
  const activeFilters = [jobType, exp, location].filter(Boolean).length;

  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-brand-navy-lt to-transparent border-b border-blue-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display font-extrabold text-3xl text-navy-700">Browse Jobs</h1>
          <p className="text-gray-500 mt-1 mb-6 text-sm">
            {total > 0 ? `${total.toLocaleString()} opportunities found` : "Searching…"}
          </p>

          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skills, keywords…"
              className="flex-1 min-w-52 bg-white border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-navy-400 focus:ring-1 focus:ring-navy-100 transition-all"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Remote"
              className="w-48 bg-white border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-navy-400 transition-all"
            />
            <button type="submit"
              className="bg-brand-green text-white font-display font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-green-700 transition-all shadow-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 sticky top-20 bg-white rounded-2xl border border-blue-100 shadow-card p-5 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-navy-700 text-sm">Filters</span>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs text-brand-green font-semibold hover:underline">
                Clear ({activeFilters})
              </button>
            )}
          </div>

          {/* Job Type */}
          <FilterGroup title="Job Type">
            {JOB_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-navy-700">
                <input
                  type="radio" name="jobType" value={t}
                  checked={jobType === t}
                  onChange={() => setJobType(t === jobType ? "" : t)}
                  className="accent-brand-green"
                />
                {t}
              </label>
            ))}
          </FilterGroup>

          {/* Experience */}
          <FilterGroup title="Experience">
            {EXPERIENCE.map((e) => (
              <label key={e} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-navy-700">
                <input
                  type="radio" name="exp" value={e}
                  checked={exp === e}
                  onChange={() => setExp(e === exp ? "" : e)}
                  className="accent-brand-green"
                />
                {e}
              </label>
            ))}
          </FilterGroup>
        </aside>

        {/* Job Grid */}
        <section className="flex-1 min-w-0">
          {/* Active filter chips */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {[jobType, exp, location].filter(Boolean).map((f) => (
                <span key={f}
                  className="inline-flex items-center gap-1.5 bg-brand-green-lt text-brand-green border border-brand-green-md rounded-full px-3 py-1 text-xs font-semibold">
                  {f}
                  <button onClick={() => {
                    if (f === jobType)  setJobType("");
                    if (f === exp)      setExp("");
                    if (f === location) setLocation("");
                  }} className="hover:opacity-70 transition-opacity">✕</button>
                </span>
              ))}
            </div>
          )}

          {loading && jobs.length === 0 ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <h3 className="font-display font-bold text-lg text-gray-500 mb-1">No jobs found</h3>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => <JobCard key={job._id || job.id} job={job} />)}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    className="font-display font-bold text-sm text-navy-700 border border-navy-200 bg-white rounded-xl px-8 py-3 hover:bg-brand-navy-lt hover:border-navy-300 transition-all disabled:opacity-50">
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

function FilterGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
      {children}
    </div>
  );
}