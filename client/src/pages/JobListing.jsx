import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";

const JOB_TYPES = [
  "Work From Home",
  "Part Time",
  "Full+Time",
  "Freelance",
  "Internship",
  "Contract",
];

const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];
const LIMIT = 12;
const VISIBLE_PAGES = 10; // show max 10 page buttons at a time, like screenshot

export default function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(0); // from API pagination.totalPages

  const [search,        setSearch]        = useState(searchParams.get("search") || "");
  const [location,      setLocation]      = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [exp,           setExp]           = useState("");

  const [minSalary, setMinSalary] = useState(5);
  const [maxSalary, setMaxSalary] = useState(200);
  const [debouncedMin, setDebouncedMin] = useState(5);
  const [debouncedMax, setDebouncedMax] = useState(200);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedMin(minSalary);
      setDebouncedMax(maxSalary);
    }, 500);
    return () => clearTimeout(t);
  }, [minSalary, maxSalary]);

  // ── Core fetch ─────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)   params.search         = search;
      if (location) params.job_location   = location;
      if (exp)      params.experience     = exp;
      if (selectedTypes.length === 1) params.type = selectedTypes[0];
      const salaryMoved = debouncedMin > 5 || debouncedMax < 200;
      if (salaryMoved) params.salary_monthly = `${debouncedMin}-${debouncedMax}`;

      const { data } = await getJobs(params);
      const fetched    = data?.data || data?.jobs || [];

      // ── Read from API pagination object ─────────────────
      // Response: { data: [...], pagination: { page, limit, total, totalPages } }
      const pagination = data?.pagination || {};
      const tot        = pagination.total      ?? fetched.length;
      const totPages   = pagination.totalPages ?? Math.ceil(tot / LIMIT);

      setJobs(fetched);
      setTotal(tot);
      setTotalPages(totPages);
    } catch (err) {
      console.error("[JobListing] fetch error:", err);
      setJobs([]);
      setTotal(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [page, search, location, selectedTypes, exp, debouncedMin, debouncedMax]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { setPage(1); }, [search, location, selectedTypes, exp, debouncedMin, debouncedMax]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    setPage(1);
  };

  const toggleType = (type) => setSelectedTypes((prev) => prev.includes(type) ? [] : [type]);
  const clearFilters = () => {
    setSelectedTypes([]); setExp(""); setLocation(""); setSearch("");
    setMinSalary(5); setMaxSalary(200); setPage(1); setSearchParams({});
  };

  const hasFilters  = selectedTypes.length > 0 || exp || location || search || debouncedMin > 5 || debouncedMax < 200;
  const salaryMoved = debouncedMin > 5 || debouncedMax < 200;

  // ── Pagination window: shows 10 pages at a time then › ─
  // e.g. page 1–10, then › jumps to 11–20, etc.
  // Matches screenshot: 1 2 3 4 5 6 7 8 9 10 ›
  const windowStart = Math.floor((page - 1) / VISIBLE_PAGES) * VISIBLE_PAGES + 1;
  const windowEnd   = Math.min(windowStart + VISIBLE_PAGES - 1, totalPages);
  const pageNums    = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);
  const hasPrev     = windowStart > 1;
  const hasNext     = windowEnd < totalPages;

  return (
    <main className="min-h-screen bg-[#f8fafd] font-sans pb-16">
      <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-4">

        {/* ── Header & Search ──────────────────────────────── */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-extrabold text-3xl text-[#0D2B6E] mb-1">
              Job <span className="text-[#3BAB35]">Listing</span>
            </h1>
            <p className="text-sm text-gray-500">
              Home / Jobs
              {total > 0 && !loading && (
                <span className="ml-2 text-[#0D2B6E] font-semibold">
                  — {total.toLocaleString()} jobs found
                </span>
              )}
            </p>
          </div>

          <div className="flex-1 w-full xl:w-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-full"
            >
              <div className="flex items-center flex-1 px-3 min-w-[200px]">
                <svg className="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Job Title, Keyword or Company"
                  className="w-full text-sm outline-none text-gray-700 bg-transparent"
                />
              </div>
              <div className="hidden md:block w-[1px] h-8 bg-gray-200"/>
              <div className="flex items-center flex-1 px-3 min-w-[180px]">
                <svg className="w-5 h-5 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <input
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, or Remote"
                  className="w-full text-sm outline-none text-gray-700 bg-transparent"
                />
              </div>
              <button type="submit" className="text-sm font-semibold text-white bg-[#0D2B6E] rounded-lg px-6 py-2 hover:bg-blue-900 shadow-md shadow-blue-900/20 shrink-0">
                Find Jobs
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                  </svg>
                  Filters
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline font-medium">Clear all</button>
                )}
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 block mb-3">Job Type</label>
                <div className="flex flex-col gap-2.5">
                  {JOB_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedTypes.includes(t) ? "bg-[#3BAB35] border-[#3BAB35]" : "border-gray-300 group-hover:border-[#3BAB35]"
                      }`}>
                        {selectedTypes.includes(t) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)}/>
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Monthly Salary</label>
                  <span className="text-xs font-bold text-[#0D2B6E]">
                    ₹{minSalary}K – ₹{maxSalary === 200 ? "200K+" : `${maxSalary}K`}
                  </span>
                </div>
                <div className="relative h-6 flex items-center">
                  <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"/>
                  <div
                    className="absolute h-1.5 bg-[#0D2B6E] rounded-full pointer-events-none"
                    style={{ left: `${((minSalary - 5) / 195) * 100}%`, right: `${100 - ((maxSalary - 5) / 195) * 100}%` }}
                  />
                  <input type="range" min="5" max="200" value={minSalary}
                    onChange={(e) => setMinSalary(Math.min(Number(e.target.value), maxSalary - 5))}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer custom-range-slider"
                    style={{ zIndex: minSalary > 100 ? 5 : 3 }}
                  />
                  <input type="range" min="5" max="200" value={maxSalary}
                    onChange={(e) => setMaxSalary(Math.max(Number(e.target.value), minSalary + 5))}
                    className="absolute w-full appearance-none bg-transparent cursor-pointer custom-range-slider"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                  <span>₹5K</span><span>₹200K+</span>
                </div>
                {salaryMoved && (
                  <p className="mt-2 text-[10px] text-[#0D2B6E] font-semibold bg-blue-50 rounded px-2 py-1">
                    salary_monthly={debouncedMin}-{debouncedMax}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Years of Experience</label>
                <select
                  value={exp} onChange={(e) => setExp(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-600 bg-white cursor-pointer focus:border-[#3BAB35]"
                >
                  <option value="">All experience levels</option>
                  {EXPERIENCE.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* ── Job Cards + Pagination ────────────────────── */}
          <section className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-[#3BAB35] border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm text-gray-400">Loading jobs…</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search terms.</p>
                {hasFilters && <button onClick={clearFilters} className="text-sm text-blue-600 underline">Clear all filters</button>}
              </div>
            ) : (
              <div className="flex flex-col gap-4">

                {/* Cards with promo banner after index 4 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {jobs.map((job, index) => {
                    if (index === 4) {
                      return (
                        <>
                          <div key="promo-banner" className="xl:col-span-2 bg-gradient-to-r from-blue-50 to-[#eef4ff] rounded-xl border border-blue-100 overflow-hidden relative flex items-center p-6 sm:p-8 my-2">
                            <div className="z-10 flex-1">
                              <h2 className="text-2xl font-bold text-[#0D2B6E] mb-4">Register now to</h2>
                              <ul className="space-y-3 mb-6">
                                {["Find all work from home jobs","Get contacted by top recruiters","Get access to courses for top skills"].map((item, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm font-semibold text-[#0D2B6E]">
                                    <div className="bg-[#0D2B6E] text-white rounded-full p-0.5">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                              <button className="bg-[#0D2B6E] text-white text-sm font-semibold rounded-full px-6 py-2.5 shadow-md flex items-center gap-2 hover:bg-blue-900 transition-colors">
                                Know More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                              </button>
                            </div>
                            <div className="hidden sm:block absolute right-0 bottom-0 h-[120%] w-1/2 opacity-90"
                              style={{ background: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600') bottom right / cover no-repeat", maskImage: "linear-gradient(to left, black, transparent)" }}
                            />
                          </div>
                          <JobCard key={job._id || job.id || index} job={job}/>
                        </>
                      );
                    }
                    return <JobCard key={job._id || job.id || index} job={job}/>;
                  })}
                </div>

                {/* ── Pagination ─────────────────────────────
                  Matches screenshot exactly:
                  [1] [2] [3] [4] [5] [6] [7] [8] [9] [10] [›]
                  Active page = green filled circle
                  › appears only when more pages exist beyond window
                ─────────────────────────────────────────── */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-10 flex-wrap">

                    {/* ‹ prev window (only if not in first block) */}
                    {hasPrev && (
                      <button
                        onClick={() => setPage(windowStart - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    )}

                    {/* Numbered page buttons */}
                    {pageNums.map((num) => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 ${
                          num === page
                            ? "bg-[#3BAB35] text-white shadow-md shadow-green-200 scale-110 border-0"
                            : "text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    {/* › next window */}
                    {hasNext && (
                      <button
                        onClick={() => setPage(windowEnd + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-range-slider::-webkit-slider-thumb {
          appearance: none; width: 16px; height: 16px;
          border-radius: 50%; background: #0D2B6E; cursor: pointer;
          pointer-events: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .custom-range-slider::-moz-range-thumb {
          width: 16px; height: 16px; border: none; border-radius: 50%;
          background: #0D2B6E; cursor: pointer; pointer-events: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}} />
    </main>
  );
}