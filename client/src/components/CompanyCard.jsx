import { useState } from "react";
import { Link } from "react-router-dom";

export default function CompanyCard({ company }) {
  const [imgErr, setImgErr] = useState(false);

  const id      = company._id || company.id;
  const name    = company.company_name || company.organization_name || company.name || "Company";
  const industry= company.industry || "";
  const city    = company.city || company.organization_city || company.location || "";
  const logo    = company.logo || company.company_logo || company.logo_url || null;
  const jobs    = company.total_jobs ?? company.job_count ?? null;

  return (
    <Link to={`/employers/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-blue-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-navy-lt border border-blue-100 overflow-hidden flex items-center justify-center">
          {logo && !imgErr
            ? <img src={logo} alt={name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
            : <span className="font-display font-bold text-2xl text-navy-700">{name[0]?.toUpperCase()}</span>
          }
        </div>
        <div>
          <h4 className="font-display font-bold text-navy-700 text-sm group-hover:text-brand-green transition-colors">{name}</h4>
          {industry && <p className="text-xs text-gray-400 mt-0.5">{industry}</p>}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {city  && <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">📍 {city}</span>}
          {jobs != null && <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">💼 {jobs} jobs</span>}
        </div>
      </div>
    </Link>
  );
}