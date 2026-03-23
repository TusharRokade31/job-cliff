import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, user, userType, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoAccent}>Job</span>Cliff
        </Link>

        {/* Desktop nav links */}
        <div style={styles.links}>
          <Link to="/"       style={{ ...styles.link, ...(isActive("/") ? styles.linkActive : {}) }}>Home</Link>
          <Link to="/jobs"   style={{ ...styles.link, ...(isActive("/jobs") ? styles.linkActive : {}) }}>Jobs</Link>
        </div>

        {/* Right side */}
        <div style={styles.actions}>
          {isLoggedIn ? (
            <>
              <span style={styles.userChip}>
                {userType === "employer" ? "🏢" : "👤"} {user?.name || user?.full_name || "Account"}
              </span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost"   style={{ fontSize: "0.875rem" }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,10,15,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border)",
  },
  inner: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    height: 64,
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontSize: "1.4rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "var(--text-primary)",
  },
  logoAccent: { color: "var(--accent)" },
  links: { display: "flex", gap: 8 },
  link: {
    padding: "6px 14px",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    transition: "var(--transition)",
  },
  linkActive: { color: "var(--text-primary)", background: "var(--bg-elevated)" },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  userChip: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 99,
    padding: "5px 12px",
  },
};
