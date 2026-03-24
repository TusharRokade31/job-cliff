import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById, applyToJob, saveJob, unsaveJob, getSaveStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const { isLoggedIn, userType } = useAuth();

  const [job,        setJob]        = useState(null);
  const [similar,    setSimilar]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saved,      setSaved]      = useState(false);
  const [applying,   setApplying]   = useState(false);
  const [applied,    setApplied]    = useState(false);
  const [msg,        setMsg]        = useState(null);
  const [logoErr,    setLogoErr]    = useState(false);

  // Ref for the Similar Jobs Carousel
  const carouselRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getJobById(jobId);
        // Handle both response shapes
        const jobData  = data?.job  || data?.data?.job  || data?.data || data;
        const simJobs  = data?.similarJobs || data?.data?.similarJobs || [];
        setJob(jobData);
        setSimilar(simJobs);
      } catch { setJob(null); }
      setLoading(false);
    })();
  }, [jobId]);

  useEffect(() => {
    if (isLoggedIn && jobId) {
      getSaveStatus(jobId)
        .then(({ data }) => setSaved(data?.is_saved || false))
        .catch(() => {});
    }
  }, [isLoggedIn, jobId]);

  const handleApply = async () => {
    if (!isLoggedIn) return navigate("/login");
    setApplying(true);
    try {
      await applyToJob(jobId);
      setApplied(true);
      setMsg({ type: "success", text: "Application submitted! Good luck 🎉" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to apply. Try again." });
    }
    setApplying(false);
  };

  const handleSave = async () => {
    if (!isLoggedIn) return navigate("/login");
    try {
      if (saved) { await unsaveJob(jobId); setSaved(false); }
      else       { await saveJob(jobId);   setSaved(true);  }
    } catch {}
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Approx card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-gray-400">
      <div className="spinner" />
      <p className="text-sm">Loading job details…</p>
    </div>
  );

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <h3 className="font-display font-bold text-xl text-gray-500">Job not found</h3>
      <Link to="/jobs" className="bg-brand-green text-white font-bold px-6 py-2.5 rounded-xl hover:bg-green-700 transition-all">
        Back to Jobs
      </Link>
    </div>
  );

  // ── Field mapping for actual API response ────────────
  const title      = job.title    || job.job_title    || "Untitled";
  const company    = job.company  || job.employer?.organization_name || job.company_name || job.employer_name || "Company";
  const location   = job.job_location || job.location || "—";
  const type       = job.job_type || job.employment_type || "Full-time";
  const salary     = job.salary_range || job.salary || null;
  const experience = job.min_experience != null ? `${job.min_experience}+ yrs` : null;
  const openings   = job.openings ?? null;
  const duration   = job.duration || null;
  const applyBy    = job.apply_by ? new Date(job.apply_by).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null;
  const posted     = job.created_at ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
  const logo       = job.employer?.logo_url || job.company_logo || job.logo || null;

  // HTML content from API
  const aboutJob      = job.about_job       || job.description     || job.job_description || "";
  const whoCanApply   = job.who_can_apply   || "";
  const duties        = job.assessment_questions || "";
  const orgDesc       = job.employer?.organization_description || "";

  // Skill / perk / certificate arrays
  const skills       = Array.isArray(job.jobSkills)       ? job.jobSkills.map(s => s.skill_name)           : Array.isArray(job.skills)   ? job.skills   : [];
  const perks        = Array.isArray(job.jobPerks)        ? job.jobPerks.map(p => p.perk_name)             : Array.isArray(job.perks)    ? job.perks    : [];
  const certs        = Array.isArray(job.jobCertificates) ? job.jobCertificates.map(c => c.certificate_name): [];

  const employer     = job.employer || {};
  const empCity      = employer.organization_city || employer.city || "";
  const empAddress   = employer.address || "";

  return (
    <main className="py-10 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-navy-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-navy-700 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-gray-500">{title}</span>
        </nav>

        <div className="flex gap-8 items-start">
          {/* ── Main Content ───────────────────────── */}
          <article className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Job Header Card */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
              <div className="flex gap-5 items-start">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-brand-navy-lt border border-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {logo && !logoErr
                    ? <img src={logo} alt={company} className="w-full h-full object-cover"
                        onError={() => setLogoErr(true)} />
                    : <span className="font-display font-extrabold text-2xl text-navy-700">{company[0]?.toUpperCase()}</span>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-extrabold text-2xl text-navy-700 leading-snug">{title}</h1>
                  <p className="text-gray-500 text-base mt-1 font-medium">{company}</p>
                  {empCity && <p className="text-xs text-gray-400 mt-0.5">📍 {empCity}</p>}

                  <div className="flex flex-wrap gap-2 mt-4">
                    <MetaChip>⏱ {type}</MetaChip>
                    <MetaChip>📍 {location}</MetaChip>
                    {salary    && <MetaChip>💰 {salary}</MetaChip>}
                    {posted    && <MetaChip>🗓 {posted}</MetaChip>}
                    {experience && <MetaChip>🎓 {experience} experience</MetaChip>}
                    {openings != null && <MetaChip>👥 {openings} opening{openings !== 1 ? "s" : ""}</MetaChip>}
                    {duration  && <MetaChip>📋 {duration}</MetaChip>}
                    {applyBy   && <MetaChip className="border-amber-200 text-amber-700 bg-amber-50">⏰ Apply by {applyBy}</MetaChip>}
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Message */}
            {msg && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                msg.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {msg.text}
              </div>
            )}

            {/* About the Job */}
            {aboutJob && (
              <Section title="About this Role">
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: aboutJob }} />
              </Section>
            )}

            {/* Who Can Apply */}
            {whoCanApply && (
              <Section title="Who Can Apply">
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: whoCanApply }} />
              </Section>
            )}

            {/* Key Responsibilities / Duties */}
            {duties && (
              <Section title="Key Responsibilities">
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: duties }} />
              </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Section title="Skills Required">
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="text-sm text-brand-green bg-brand-green-lt border border-brand-green-md rounded-full px-3.5 py-1 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Certificates */}
            {certs.length > 0 && (
              <Section title="Preferred Certificates">
                <div className="flex flex-wrap gap-2">
                  {certs.map((c) => (
                    <span key={c} className="text-sm text-navy-600 bg-brand-navy-lt border border-blue-100 rounded-full px-3.5 py-1 font-medium">
                      🎓 {c}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Perks */}
            {perks.length > 0 && (
              <Section title="Perks & Benefits">
                <div className="flex flex-wrap gap-2">
                  {perks.map((p) => (
                    <span key={p} className="text-sm text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-3.5 py-1 font-medium">
                      ✨ {p}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* About the Company */}
            {(orgDesc || empAddress) && (
              <Section title={`About ${company}`}>
                {orgDesc && <div className="rich-text" dangerouslySetInnerHTML={{ __html: orgDesc }} />}
                {empAddress && (
                  <p className="text-sm text-gray-500 mt-3 flex items-start gap-2">
                    <span>📍</span><span>{empAddress}</span>
                  </p>
                )}
              </Section>
            )}

          </article>

          {/* ── Sticky Sidebar ──────────────────────── */}
          <aside className="w-72 flex-shrink-0 sticky top-20 flex flex-col gap-4">

            {/* CTA Card */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6 flex flex-col gap-3">
              <h3 className="font-display font-bold text-navy-700 text-lg">Interested in this role?</h3>
              <p className="text-xs text-gray-400">
                {isLoggedIn ? "Submit your application in one click." : "Login to apply to this job."}
              </p>

              <button
                onClick={handleApply}
                disabled={applying || applied}
                className="w-full bg-green-700 text-white font-display font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                {applied ? "✓ Applied" : applying ? "Submitting…" : "Apply Now"}
              </button>

              <button
                onClick={handleSave}
                className={`w-full border font-display font-bold py-2.5 rounded-xl transition-all text-sm ${
                  saved
                    ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                    : "border-blue-100 text-gray-600 bg-white hover:bg-blue-50"
                }`}>
                {saved ? "♥ Saved" : "♡ Save Job"}
              </button>

              {!isLoggedIn && (
                <p className="text-xs text-gray-400 text-center">
                  <Link to="/login" className="text-brand-green font-semibold hover:underline">Login</Link> to apply or save this job.
                </p>
              )}
            </div>

            {/* Job Summary */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-5">
              <h4 className="font-display font-bold text-navy-700 text-sm mb-4">Job Summary</h4>
              <div className="flex flex-col divide-y divide-blue-50">
                {[
                  ["Job Type",    type],
                  ["Location",    location],
                  ["Salary",      salary || "Not disclosed"],
                  ["Experience",  experience || "Any"],
                  ["Openings",    openings != null ? `${openings} position${openings !== 1 ? "s" : ""}` : "—"],
                  ["Duration",    duration || "—"],
                  ["Posted",      posted  || "—"],
                  ["Apply By",    applyBy || "Open"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-start py-2.5">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs text-navy-700 font-semibold text-right max-w-36">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>

      </div>

      {/* ── Match the UI exactly for Similar Jobs  ──────────────────────── */}
      {similar.length > 0 && (
        <section className="bg-[#f9fafd] mt-20 py-12 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            
            {/* Header section matching the image exactly */}
            <div className="text-center mb-10">
              <h2 className="font-display font-bold text-3xl text-black">
                Similar <span className="text-blue-900">Job Openings</span>
              </h2>
              <p className="text-sm text-gray-500 mt-3 max-w-2xl mx-auto leading-relaxed">
                Gain the skills, support, and opportunities you need to build a stable, dignified career — all through Vedanta's employment and training initiatives.
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              <div 
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {similar.map((job) => (
                  <SimilarJobCard key={job.id || job._id} job={job} />
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex justify-center items-center gap-3 mt-4">
                <button 
                  onClick={() => scrollCarousel("left")}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                <button 
                  onClick={() => scrollCarousel("right")}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Call to Action Box */}
            <div className="mt-14 bg-[#edf4fd] rounded-2xl p-8 flex flex-col items-center justify-center border border-blue-100 shadow-sm">
              <h3 className="font-bold text-navy-800 text-xl mb-6">
                Looking For More Such <span className="text-blue-500">Similar Opportunities?</span>
              </h3>
              <Link to="/register" className="bg-[#1067b4] text-white px-8 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md text-sm">
                Sign Up 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>

          </div>
        </section>
      )}

    </main>
  );
}

// Helper Components
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-card p-6">
      <h2 className="font-display font-bold text-navy-700 text-base mb-4 pb-3 border-b border-blue-50">{title}</h2>
      {children}
    </div>
  );
}

function MetaChip({ children, className = "" }) {
  return (
    <span className={`text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 ${className}`}>
      {children}
    </span>
  );
}

// Custom Job Card specifically crafted to match the Exact screenshot
function SimilarJobCard({ job }) {
  // Strip HTML from description for a clean snippet
  const snippet = job.description?.replace(/<[^>]*>?/gm, '') || "";

  return (
    <div className="bg-white border border-gray-100 rounded-[20px] p-5 w-[330px] flex flex-col flex-shrink-0 snap-center shadow-sm hover:shadow-md transition-all">
      {/* Top Header: Logo, Title, Company */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-bold text-gray-400">{job.company?.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{job.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{job.company}</p>
        </div>
      </div>

      {/* Badges Layout (Matching the green theme from the image) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.location && (
           <span className="bg-[#eef8f2] text-[#429555] text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
             📍 {job.location}
           </span>
        )}
        {job.type && (
           <span className="bg-[#eef8f2] text-[#429555] text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
             ⏱ {job.type}
           </span>
        )}
        {job.salary && (
           <span className="bg-[#eef8f2] text-[#429555] text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1">
             💰 {job.salary}
           </span>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mb-2 font-medium">{job.postedDate || "Recently posted"}</p>

      {/* Description Snippet */}
      <p className="text-xs text-gray-600 line-clamp-2 mb-5 flex-1 leading-relaxed">
        {snippet}
      </p>

      {/* Footer Buttons */}
      <div className="flex items-center gap-2 mt-auto">
        <Link 
          to={`/jobs/${job.id}`} 
          className="flex-1 bg-[#61b846] text-white text-center text-sm font-bold py-2.5 rounded-full hover:bg-green-700 transition-colors"
        >
          Apply Now
        </Link>
        <button className="w-[42px] h-[42px] flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}