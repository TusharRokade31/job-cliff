import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, userType, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isActive     = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <header className="w-full font-sans sticky top-0 z-50 bg-white">
      {/* Top Green Banner */}
      <div className="bg-[#1ea164] text-white text-xs py-1.5 px-6 flex justify-between md:justify-end items-center gap-6">
        <span>Empowering Future Citizens with Essential Life Skills</span>
        <select className="bg-white text-gray-800 text-xs px-2 py-0.5 rounded outline-none border-none cursor-pointer">
          <option>English</option>
        </select>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/jobclif.webp"
              alt="JobCliff"
              className="h-15 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="hidden flex-col">
              <span className="font-extrabold text-xl tracking-tight leading-none">
                <span className="text-[#0D2B6E]">job</span>
                <span className="text-[#3BAB35]">cliff</span>
              </span>
              <span className="text-[0.6rem] text-gray-500 uppercase tracking-widest mt-0.5">A Not for Profit Initiative</span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {[
              ["About Us", "/about"], ["Jobs", "/jobs"], ["Companies", "/companies"],
              ["Courses", "/courses"], ["Blogs", "/blogs"], ["FAQs", "/faqs"], ["Contact", "/contact"]
            ].map(([label, path]) => (
              <Link key={path} to={path}
                className={`text-sm font-semibold transition-colors ${
                  isActive(path) ? "text-[#0D2B6E]" : "text-gray-800 hover:text-[#3BAB35]"
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Auth / Action Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* ── Post Job button — only for employers ── */}
                {userType === "employer" && (
                  <Link
                    to="/employer/post-job"
                    className={`text-sm font-bold px-5 py-2 rounded-full transition-all ${
                      isActive("/employer/post-job")
                        ? "bg-navy-700 text-white"
                        : "bg-green-500 text-white hover:opacity-90"
                    }`}
                  >
                    + Post Job
                  </Link>
                )}

                {/* Logged-in user pill */}
                <span className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 font-medium">
                  {userType === "employer" ? "🏢" : "👤"}
                  {user?.name || user?.full_name || user?.company_name || "Account"}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-700 border border-gray-300 bg-white rounded-full px-5 py-2 hover:bg-gray-50 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-semibold text-[#0D2B6E] border border-[#0D2B6E] rounded-full px-6 py-2 hover:bg-blue-50 transition-all">
                  Jobseeker
                </Link>
                <Link to="/register"
                  className="text-sm font-semibold text-[#0D2B6E] border border-[#0D2B6E] rounded-full px-6 py-2 hover:bg-blue-50 transition-all">
                  Employer
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
}