import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerEmployee, registerEmployer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [tab,     setTab]     = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [empForm,    setEmpForm]    = useState({ name: "", email: "", password: "", mobile: "", job_title: "", skills: "" });
  const [emplorForm, setEmplorForm] = useState({ name: "", email: "", password: "", mobile: "", company_name: "", industry: "" });

  const { login } = useAuth();
  const navigate  = useNavigate();

  const updateEmp    = (k, v) => setEmpForm(p => ({ ...p, [k]: v }));
  const updateEmplor = (k, v) => setEmplorForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (tab === "employee") {
        const body = { ...empForm, skills: empForm.skills.split(",").map(s => s.trim()).filter(Boolean) };
        const { data } = await registerEmployee(body);
        setSuccess("Account created! Matching employers have been notified. Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user  = data?.data?.user || data?.user || data?.data || body;
          if (token) { login(user, "employee", token); navigate("/"); }
          else navigate("/login");
        }, 2000);
      } else {
        const { data } = await registerEmployer(emplorForm);
        setSuccess("Employer account created! Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user  = data?.data || emplorForm;
          if (token) { login(user, "employer", token); navigate("/"); }
          else navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy-lt to-blue-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-blue-100 shadow-card-hover p-10 flex flex-col gap-5">

        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-2xl text-center tracking-tight">
          <span className="text-navy-700">job</span><span className="text-brand-green">cliff</span>
        </Link>

        <h1 className="font-display font-extrabold text-2xl text-navy-700 text-center">Create Account</h1>

        {/* Tabs */}
        <div className="flex bg-blue-50 rounded-xl p-1 gap-1">
          {["employee", "employer"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? "bg-white text-navy-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}>
              {t === "employee" ? "👤 Job Seeker" : "🏢 Employer"}
            </button>
          ))}
        </div>

        {/* Info box */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-xs text-purple-700">
          {tab === "employee"
            ? "📧 After sign-up, matching employers will be emailed about your profile automatically."
            : "📧 When you post a job, matching candidates will receive an email alert automatically."}
        </div>

        {error   && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === "employee" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name"   value={empForm.name}       onChange={v => updateEmp("name", v)}       placeholder="John Doe"       required />
                <Field label="Mobile"      value={empForm.mobile}     onChange={v => updateEmp("mobile", v)}     placeholder="+91 9876543210" />
              </div>
              <Field label="Email"            value={empForm.email}    onChange={v => updateEmp("email", v)}    placeholder="you@email.com"    type="email" required />
              <Field label="Password"         value={empForm.password} onChange={v => updateEmp("password", v)} placeholder="Min 8 characters" type="password" required />
              <Field label="Desired Job Title" value={empForm.job_title} onChange={v => updateEmp("job_title", v)} placeholder="Frontend Developer" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Skills <span className="font-normal text-gray-400">(comma separated)</span>
                </label>
                <input
                  value={empForm.skills}
                  onChange={(e) => updateEmp("skills", e.target.value)}
                  placeholder="React, Node.js, Python…"
                  className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-navy-400 focus:bg-white transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Contact Name" value={emplorForm.name}         onChange={v => updateEmplor("name", v)}         placeholder="Jane Smith" required />
                <Field label="Mobile"       value={emplorForm.mobile}       onChange={v => updateEmplor("mobile", v)}       placeholder="+91 9876543210" />
              </div>
              <Field label="Email"          value={emplorForm.email}        onChange={v => updateEmplor("email", v)}        placeholder="hr@company.com" type="email" required />
              <Field label="Password"       value={emplorForm.password}     onChange={v => updateEmplor("password", v)}     placeholder="Min 8 characters" type="password" required />
              <Field label="Company Name"   value={emplorForm.company_name} onChange={v => updateEmplor("company_name", v)} placeholder="Acme Corp" required />
              <Field label="Industry"       value={emplorForm.industry}     onChange={v => updateEmplor("industry", v)}     placeholder="Technology, Finance…" />
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-navy-700 text-white font-display font-bold py-3 rounded-xl hover:bg-navy-800 transition-all disabled:opacity-60 mt-2">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-green font-semibold hover:underline">Login</Link>
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