import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerEmployee, registerEmployer } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [tab, setTab] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [empForm, setEmpForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    designation: "", 
    password: "", 
    whatsapp: false 
  });
  
  const [emplorForm, setEmplorForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    mobile: "", 
    company_name: "", 
    industry: "" 
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const updateEmp = (k, v) => setEmpForm(p => ({ ...p, [k]: v }));
  const updateEmplor = (k, v) => setEmplorForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(""); 
    setSuccess("");
    
    try {
      if (tab === "employee") {
        const numericPhone = empForm.phone ? Number(empForm.phone.replace(/\D/g, '')) : null;

        const body = { 
          firstName: empForm.firstName,
          lastName: empForm.lastName,
          full_name: `${empForm.firstName} ${empForm.lastName}`.trim(), // Added to satisfy notNull Violation
          email: empForm.email,
          officialEmail: empForm.email,
          official_email: empForm.email,
          phone: empForm.phone,
          phone_number: numericPhone, 
          designation: empForm.designation,
          password: empForm.password,
          whatsapp: empForm.whatsapp
        };
        
        const { data } = await registerEmployee(body);
        setSuccess("Account created! Matching employers have been notified. Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user = data?.data?.user || data?.user || data?.data || body;
          if (token) { login(user, "employee", token); navigate("/"); }
          else navigate("/login");
        }, 2000);

      } else {
        const numericMobile = emplorForm.mobile ? Number(emplorForm.mobile.replace(/\D/g, '')) : null;

        const employerBody = {
          firstName: emplorForm.firstName,
          lastName: emplorForm.lastName,
          full_name: `${emplorForm.firstName} ${emplorForm.lastName}`.trim(), // Added to satisfy notNull Violation
          email: emplorForm.email,
          officialEmail: emplorForm.email,
          official_email: emplorForm.email,
          mobile: emplorForm.mobile,
          phone_number: numericMobile, 
          password: emplorForm.password,
          company_name: emplorForm.company_name,
          industry: emplorForm.industry
        }

        const { data } = await registerEmployer(employerBody);
        setSuccess("Employer account created! Redirecting…");
        setTimeout(() => {
          const token = data?.token || data?.data?.token;
          const user = data?.data || emplorForm;
          if (token) { login(user, "employer", token); navigate("/"); }
          else navigate("/login");
        }, 2000);
      }
    } catch (err) {
      // Trying to catch nested sequelize errors like the one in your screenshot
      const errorMsg = err?.response?.data?.upstream?.error 
        || err?.response?.data?.error 
        || err?.response?.data?.message 
        || "Registration failed. Please try again.";
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy-lt to-blue-50 px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-blue-100 shadow-card-hover p-8 flex flex-col gap-5">

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

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{success}</div>}

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "employee" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" id="firstName" placeholder="First Name" required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.firstName} onChange={e => updateEmp("firstName", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" id="lastName" placeholder="Last Name" required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.lastName} onChange={e => updateEmp("lastName", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Id</label>
                    <input type="email" id="email" placeholder="jhondoe@gmail.com" required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.email} onChange={e => updateEmp("email", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone Number</label>
                    <input type="tel" id="phone" placeholder="98765 43210" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.phone} onChange={e => updateEmp("phone", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="designation" className="block text-sm font-medium mb-2">Designation</label>
                    <input type="text" id="designation" placeholder="Designation" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.designation} onChange={e => updateEmp("designation", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                    <input type="password" id="password" placeholder="At least 6 characters" required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none" 
                      value={empForm.password} onChange={e => updateEmp("password", e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center">
                  <input type="checkbox" id="whatsapp" className="mr-2" 
                    checked={empForm.whatsapp} onChange={e => updateEmp("whatsapp", e.target.checked)} />
                  <label htmlFor="whatsapp" className="text-sm font-medium cursor-pointer">Receive Job Alerts on WhatsApp</label>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field id="firstName" label="First Name" value={emplorForm.firstName} onChange={v => updateEmplor("firstName", v)} placeholder="Jane" required />
                  <Field id="lastName" label="Last Name" value={emplorForm.lastName} onChange={v => updateEmplor("lastName", v)} placeholder="Smith" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field id="email" label="Official Email" value={emplorForm.email} onChange={v => updateEmplor("email", v)} placeholder="hr@company.com" type="email" required />
                  <Field id="mobile" label="Mobile" value={emplorForm.mobile} onChange={v => updateEmplor("mobile", v)} placeholder="+91 9876543210" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field id="company_name" label="Company Name" value={emplorForm.company_name} onChange={v => updateEmplor("company_name", v)} placeholder="Acme Corp" required />
                  <Field id="industry" label="Industry" value={emplorForm.industry} onChange={v => updateEmplor("industry", v)} placeholder="Technology, Finance…" />
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <Field id="password" label="Password" value={emplorForm.password} onChange={v => updateEmplor("password", v)} placeholder="Min 8 characters" type="password" required />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-green-500 text-white py-2 mt-4 rounded-full font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              {loading ? "Creating account…" : "Register"}
            </button>
            
            <p className="text-center text-sm pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-prime font-medium hover:underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type} id={id} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-prime focus:border-prime outline-none transition-all"
      />
    </div>
  );
}