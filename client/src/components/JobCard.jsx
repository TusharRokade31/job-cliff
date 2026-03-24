import { useState } from "react";
import { Link } from "react-router-dom";
import { saveJob, unsaveJob } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobCard({ job }) {
  const { isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(job.is_saved || false);
  const [imgErr, setImgErr] = useState(false);

  const id = job._id || job.id;
  const title = job.title || job.job_title || "Untitled Role";
  const company = job.company_name || job.employer?.organization_name || job.employer_name || job.company || "Company";
  const location = job.job_location || job.location || "Remote";
  const type = job.job_type || job.employment_type || job.type || "Full Time";
  const salary = job.salary_range || job.salary || "Not specified";
  const desc = job.description || job.desc || "We are looking for a skilled professional to join our team. The candidate should be passionate and driven with the ability to deliver high-quality work...";
  
  const posted = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : job.posted || "4 days ago";
    
  const logo = job.company_logo || job.employer?.logo_url || job.logo || null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    try {
      if (saved) { await unsaveJob(id); setSaved(false); }
      else { await saveJob(id); setSaved(true); }
    } catch { /* silent */ }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full relative">
      
      {/* Header: Logo, Title, Company */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
          {logo && !imgErr ? (
            <img src={logo} alt={company} className="w-full h-full object-contain p-1" onError={() => setImgErr(true)} />
          ) : (
            <span className="font-bold text-xl text-[#0D2B6E]">{(company)[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <Link to={`/jobs/${id}`} className="block group">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-[#3BAB35] transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{company}</p>
          </Link>
        </div>
      </div>

      {/* Tags: Location, Type, Salary */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3BAB35] bg-[#eefaf2] rounded-full px-3 py-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          {location}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3BAB35] bg-[#eefaf2] rounded-full px-3 py-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {type}
        </span>
        {salary !== "Not specified" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3BAB35] bg-[#eefaf2] rounded-full px-3 py-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {salary}
          </span>
        )}
      </div>

      {/* Posted info & Description */}
      <div className="mb-4 flex-1">
        <p className="text-[11px] text-gray-400 mb-2 font-medium">Posted {posted}</p>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }}/>
          {/* {desc} */}
        {/* </p> */}
        {/* <div className="rich-text"  /> */}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <Link to={`/jobs/${id}`} className="flex-1 bg-[#6ebe49] hover:bg-[#5aa838] text-white text-center text-sm font-semibold rounded-full py-2.5 transition-colors shadow-sm">
          Apply Now
        </Link>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-semibold text-sm flex-shrink-0">
         <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
</svg>
        </button>
        <button 
          onClick={handleSave} 
          className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-colors flex-shrink-0 ${saved ? "text-red-500 bg-red-50 border-red-100" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
      </div>
    </div>
  );
}