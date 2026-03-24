import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobs } from "../services/api";
import JobCard from "../components/JobCard";

const JOB_TYPES = ["Remote", "Part-Time", "Full-Time", "Freelance", "Onsite", "Contract Based", "Internship"];
const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

export default function JobListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [exp, setExp] = useState("");
  
  // UI Slider States
  const [minSalary, setMinSalary] = useState(5);
  const [maxSalary, setMaxSalary] = useState(200);

  // Debounced states for API calls
  const [debouncedMin, setDebouncedMin] = useState(5);
  const [debouncedMax, setDebouncedMax] = useState(200);

  // 1. Debounce the salary slider so it doesn't spam the API while dragging
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMin(minSalary);
      setDebouncedMax(maxSalary);
    }, 500); // Waits 500ms after you stop sliding
    return () => clearTimeout(handler);
  }, [minSalary, maxSalary]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page, limit: 10 };
      
      if (search) params.search = search;
      if (location) params.job_location = location;
      if (exp) params.experience = exp;
      if (selectedTypes.length > 0) {
        params.job_type = selectedTypes.join(','); 
      }
      
      // 2. CHECK YOUR BACKEND: Change these keys if your API expects something else (e.g., minSalary instead of min_salary)
      if (debouncedMin > 5) params.min_salary = debouncedMin * 1000;
      if (debouncedMax < 200) params.max_salary = debouncedMax * 1000;
      
      const { data } = await getJobs(params);
      let fetched = data?.data || data?.jobs || [];
      const tot = data?.total || fetched.length || 0; 

      // OPTIONAL FRONTEND FILTER: If your backend DOES NOT handle salary filtering yet, this forces it on the frontend
      if (debouncedMin > 5 || debouncedMax < 200) {
        fetched = fetched.filter(job => {
          // Assuming job.salary comes as a number or string like "10k - 15k". Adjust regex based on your API response.
          const salaryNumbers = String(job.salary || "").match(/\d+/g);
          if (!salaryNumbers) return true; // Keep jobs with no salary defined
          
          const jobMin = parseInt(salaryNumbers[0]) || 0;
          return jobMin >= debouncedMin && jobMin <= debouncedMax;
        });
      }

      setTotal(tot);
      setJobs(fetched); 
    } catch (err) {
      console.error(err);
      
      // Filter the dummy data so you can test the slider visually
      const dummyJobs = Array(8).fill(null).map((_, i) => ({
        id: i, title: "Hair Dresser / Hair Stylist", company: "Papa Beauty Parlour",
        location: "Mumbai, 400078", type: "Full Time", salary: `${10 + (i * 10)}k - ${20 + (i * 10)}k`, 
        posted: "4 days ago", desc: "We are looking for a skilled and creative Hair Dresser to join our team..."
      })).filter(job => {
        const jobMin = parseInt(job.salary.split('k')[0]);
        return jobMin >= debouncedMin && jobMin <= debouncedMax;
      });

      setJobs(dummyJobs);
      setTotal(dummyJobs.length);
    }
    setLoading(false);
  }, [page, search, location, selectedTypes, exp, debouncedMin, debouncedMax]);

  // Fetch jobs whenever parameters or page change
  useEffect(() => { 
    fetchJobs(); 
  }, [fetchJobs]);

  // Reset to Page 1 if the user changes filters or location
  useEffect(() => {
    setPage(1);
  }, [search, location, selectedTypes, exp, debouncedMin, debouncedMax]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    setPage(1); 
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setExp("");
    setLocation("");
    setSearch("");
    setMinSalary(5);
    setMaxSalary(200);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#f8fafd] font-sans pb-16">
      <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-4">
        
        {/* Header & Main Search Bar */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-extrabold text-3xl text-[#0D2B6E] mb-1">Job <span className="text-[#3BAB35]">Listing</span></h1>
            <p className="text-sm text-gray-500">Home / Jobs</p>
          </div>

          <div className="flex-1 w-full xl:w-auto">
            <form onSubmit={handleSearch} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-full">
              <div className="flex items-center flex-1 px-3 min-w-[200px]">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Job Title, Keyword or Company" className="w-full text-sm outline-none text-gray-700 bg-transparent" />
              </div>
              <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>
              <div className="flex items-center flex-1 px-3 min-w-[200px]">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State, Zip Code or Remote" className="w-full text-sm outline-none text-gray-700 bg-transparent" />
              </div>
              
              <div className="flex items-center gap-2 ml-auto w-full md:w-auto justify-end">
                <button type="submit" className="text-sm font-semibold text-white bg-[#0D2B6E] rounded-lg px-6 py-2 hover:bg-blue-900 shadow-md shadow-blue-900/20">
                  Find Jobs
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
            
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                  Filters
                </div>
                {(selectedTypes.length > 0 || exp || location || search || minSalary > 5 || maxSalary < 200) && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Job Types */}
              <div className="mb-6 flex flex-col gap-3">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Job Type</label>
                {JOB_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedTypes.includes(t) ? 'bg-[#3BAB35] border-[#3BAB35]' : 'border-gray-300 group-hover:border-[#3BAB35]'}`}>
                      {selectedTypes.includes(t) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedTypes.includes(t)} onChange={() => toggleType(t)} />
                    {t}
                  </label>
                ))}
              </div>

              {/* Functional Dual Range Slider for Salary */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Salary Range</label>
                  <span className="text-xs font-bold text-[#0D2B6E]">
                    ₹{minSalary}K - ₹{maxSalary}K{maxSalary === 200 ? '+' : ''}
                  </span>
                </div>
                
                <div className="relative h-6 flex items-center">
                  {/* Track Background */}
                  <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
                  
                  {/* Active Track Highlight */}
                  <div 
                    className="absolute h-1.5 bg-[#0D2B6E] rounded-full pointer-events-none transition-all duration-75"
                    style={{
                      left: `${((minSalary - 5) / 195) * 100}%`,
                      right: `${100 - ((maxSalary - 5) / 195) * 100}%`
                    }}
                  ></div>
                  
                  {/* Min Slider */}
                  <input 
                    type="range" 
                    min="5" 
                    max="200" 
                    value={minSalary} 
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), maxSalary - 5);
                      setMinSalary(value);
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer custom-range-slider"
                    style={{ zIndex: minSalary > 100 ? 5 : 3 }}
                  />
                  
                  {/* Max Slider */}
                  <input 
                    type="range" 
                    min="5" 
                    max="200" 
                    value={maxSalary} 
                    onChange={(e) => {
                      const value = Math.max(Number(e.target.value), minSalary + 5);
                      setMaxSalary(value);
                    }}
                    className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer custom-range-slider"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                  <span>₹5K</span>
                  <span>₹200K+</span>
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Years of Experience</label>
                <select 
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-600 bg-white cursor-pointer focus:border-[#3BAB35]"
                >
                  <option value="">Select years of experience</option>
                  {EXPERIENCE.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main Job Grid */}
          <section className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="flex justify-center py-20 text-[#3BAB35]">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {jobs.map((job, index) => {
                    if (index === 4) {
                      return (
                        <div key="promo-banner" className="xl:col-span-2 bg-gradient-to-r from-blue-50 to-[#eef4ff] rounded-xl border border-blue-100 overflow-hidden relative flex items-center p-6 sm:p-8 mt-2 mb-2">
                          <div className="z-10 flex-1">
                            <h2 className="text-2xl font-bold text-[#0D2B6E] mb-4">Register now to</h2>
                            <ul className="space-y-3 mb-6">
                              {["Find all work from home jobs", "Get contacted by top recruiters", "Get access to courses for top skills"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-semibold text-[#0D2B6E]">
                                  <div className="bg-[#0D2B6E] text-white rounded-full p-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                  </div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <button className="bg-[#0D2B6E] text-white text-sm font-semibold rounded-full px-6 py-2.5 shadow-md flex items-center gap-2 hover:bg-blue-900 transition-colors">
                              Know More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                          </div>
                          <div className="hidden sm:block absolute right-0 bottom-0 h-[120%] w-1/2 opacity-90" style={{ background: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600') bottom right / cover no-repeat", maskImage: "linear-gradient(to left, black, transparent)" }}></div>
                        </div>
                      );
                    }
                    return <JobCard key={job._id || job.id || index} job={job} />;
                  })}
                </div>

                {/* Pagination */}
                {total > 10 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                    {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map(num => (
                      <button 
                        key={num} 
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${num === page ? "bg-[#0D2B6E] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button 
                      onClick={() => setPage(p => Math.min(Math.ceil(total / 10), p + 1))}
                      disabled={page === Math.ceil(total / 10)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0D2B6E;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .custom-range-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: #0D2B6E;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}} />
    </main>
  );
}