import { useState } from "react";
import { Link } from "react-router-dom";
import { saveJob, unsaveJob } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function JobCard({ job }) {
  const { isLoggedIn } = useAuth();
  const [saved,  setSaved]  = useState(job.is_saved || false);
  const [saving, setSaving] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const id       = job._id || job.id;
  const title    = job.title || job.job_title || "Untitled Role";
  const company  = job.company_name || job.employer?.organization_name || job.employer_name || job.company || "Company";
  const location = job.job_location || job.location || "Remote";
  const type     = job.job_type || job.employment_type || job.type || "Full-time";
  const skills   = Array.isArray(job.skills) ? job.skills.slice(0, 3)
                  : Array.isArray(job.jobSkills) ? job.jobSkills.slice(0, 3).map(s => s.skill_name)
                  : [];
  const salary   = job.salary_range || job.salary || null;
  const posted   = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : job.postedDate || "";
  const logo     = job.company_logo || job.employer?.logo_url || job.logo || null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || saving) return;
    setSaving(true);
    try {
      if (saved) { await unsaveJob(id); setSaved(false); }
      else        { await saveJob(id);   setSaved(true);  }
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <Link to={`/jobs/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-blue-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-3 h-full">

        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 rounded-xl bg-brand-navy-lt border border-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {logo && !imgErr
              ? <img src={logo} alt={company} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
              : <span className="font-display font-bold text-lg text-navy-700">{(company)[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-brand-green-lt text-brand-green border border-brand-green-md rounded-full px-3 py-1">
              {type}
            </span>
            {posted && <span className="text-xs text-gray-400">{posted}</span>}
          </div>
        </div>

        {/* Title + company */}
        <div>
          <h3 className="font-display font-bold text-navy-700 text-base leading-snug group-hover:text-brand-green transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{company}</p>
        </div>

        {/* Location + salary */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
            📍 {location}
          </span>
          {salary && (
            <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
              💰 {salary}
            </span>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s} className="text-xs text-navy-600 bg-brand-navy-lt border border-blue-100 rounded-full px-2.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-blue-50">
          <span className="text-xs font-bold text-brand-green group-hover:underline">View Details →</span>
          {isLoggedIn && (
            <button
              onClick={handleSave}
              className={`text-lg px-2 py-1 transition-colors ${saved ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
              title={saved ? "Unsave" : "Save job"}>
              {saved ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}