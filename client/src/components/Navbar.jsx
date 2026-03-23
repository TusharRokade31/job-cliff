import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, userType, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #e2eaf8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo image */}
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/jobclif.webp"
            alt="JobCliff"
            style={{ height: 40, width: "auto", objectFit: "contain" }}
            onError={(e) => {
              // fallback to text if logo not found
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "inline";
            }}
          />
          <span style={{ display: "none", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>
            <span style={{ color: "#0D2B6E" }}>job</span><span style={{ color: "#3BAB35" }}>cliff</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {[["Home", "/"], ["Browse Jobs", "/jobs"]].map(([label, path]) => (
            <Link key={path} to={path} style={{
              padding: "8px 16px",
              borderRadius: 12,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: isActive(path) ? "#0D2B6E" : "#6b7280",
              background: isActive(path) ? "#edf2fb" : "transparent",
              transition: "all 0.15s",
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Auth actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn ? (
            <>
              <span style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: "0.82rem", color: "#4b5563",
                background: "#edf2fb", border: "1px solid #d0dff5",
                borderRadius: 99, padding: "6px 14px",
              }}>
                {userType === "employer" ? "🏢" : "👤"}
                {user?.name || user?.full_name || "Account"}
              </span>
              <button onClick={handleLogout} style={{
                fontSize: "0.82rem", fontWeight: 600,
                color: "#374151", border: "1px solid #d1d5db",
                background: "#fff", borderRadius: 10,
                padding: "8px 16px", cursor: "pointer",
                transition: "all 0.15s",
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0D2B6E" }}>
                Login
              </Link>
              <Link to="/register" style={{
                fontSize: "0.875rem", fontWeight: 700,
                background: "#3BAB35", color: "#fff",
                borderRadius: 10, padding: "9px 20px",
                boxShadow: "0 2px 8px rgba(59,171,53,0.2)",
                transition: "all 0.15s",
              }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}