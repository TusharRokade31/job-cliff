import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginEmployee, loginEmployer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [tab,      setTab]      = useState("employee");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const fn = tab === "employee" ? loginEmployee : loginEmployer;
      const { data } = await fn({ email, password });
      const token = data?.token || data?.data?.token;
      const user  = data?.data?.user || data?.user || data?.data || {};
      login(user, tab, token);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy-lt to-blue-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-blue-100 shadow-card-hover p-10 flex flex-col gap-5">

        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-2xl text-center tracking-tight">
          <span className="text-navy-700">job</span><span className="text-brand-green">cliff</span>
        </Link>

        <div className="text-center">
          <h1 className="font-display font-extrabold text-2xl text-navy-700">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Log in to your account</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-blue-50 rounded-xl p-1 gap-1">
          {["employee", "employer"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-navy-700 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}>
              {t === "employee" ? "👤 Job Seeker" : "🏢 Employer"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

          <Link to="/forgot-password" className="text-xs text-brand-green text-right font-semibold hover:underline -mt-2">
            Forgot password?
          </Link>

          <button type="submit" disabled={loading}
            className="w-full bg-navy-700 text-white font-display font-bold py-3 rounded-xl hover:bg-navy-800 transition-all disabled:opacity-60">
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-green font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-navy-400 focus:bg-white focus:ring-2 focus:ring-navy-100 transition-all"
      />
    </div>
  );
}