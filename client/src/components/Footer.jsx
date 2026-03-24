import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full font-sans bg-white border-t border-gray-100">
      
      {/* Top Banner - Partners */}
      <div className="bg-[#111827] w-full py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-white font-bold text-lg">Proud Partner Of<br/>Leading Government Bodies</h2>
          <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-inner">
            <div className="font-bold text-[#0D2B6E] text-xl px-2 border-r border-gray-300">N S D C</div>
            <div className="font-bold text-[#0D2B6E] text-xl px-2">Skill India</div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/jobclif.webp" alt="JobCliff" className="h-20 w-auto object-contain" />
              <div className="hidden flex-col">
                <span className="font-extrabold text-xl tracking-tight leading-none">
                  <span className="text-[#0D2B6E]">job</span><span className="text-[#3BAB35]">cliff</span>
                </span>
                <span className="text-[0.6rem] text-[#0D2B6E] uppercase tracking-widest mt-0.5">A Not for Profit Initiative</span>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-600 hover:text-[#3BAB35]">Home</Link></li>
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-[#3BAB35]">About Us</Link></li>
              <li><Link to="/jobs" className="text-sm text-gray-600 hover:text-[#3BAB35]">Jobs</Link></li>
              <li><Link to="/companies" className="text-sm text-gray-600 hover:text-[#3BAB35]">Companies</Link></li>
              <li><Link to="/blogs" className="text-sm text-gray-600 hover:text-[#3BAB35]">Blogs</Link></li>
            </ul>
          </div>

          {/* Registration / Links */}
          <div>
            <ul className="space-y-2 mt-9">
              <li><Link to="/register-institution" className="text-sm text-gray-600 hover:text-[#3BAB35]">Register your institution</Link></li>
              <li><Link to="/faqs" className="text-sm text-gray-600 hover:text-[#3BAB35]">FAQs</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 hover:text-[#3BAB35]">Contact</Link></li>
              <li><Link to="/hire" className="text-sm font-semibold text-[#3BAB35] bg-green-50 px-3 py-1 rounded inline-block">Hire Interns</Link></li>
            </ul>
          </div>

          {/* Reach Out */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Reach Out</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Phone: +91 86568 95614</li>
              <li>Email: info@jobcliff.com</li>
              <li className="leading-relaxed mt-2">Jobcliff - Vedanta Foundation<br/>Office No. 01, Moral House, 26/30, Goa Street, Ballard Estate, Fort, Mumbai, Maharashtra - 400001</li>
            </ul>
          </div>
        </div>

        {/* Detailed Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-100 pt-10 mb-10">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">In-demand Careers</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/career/data-scientist" className="hover:text-[#0D2B6E]">Data Scientist</Link></li>
              <li><Link to="/career/full-stack" className="hover:text-[#0D2B6E]">Full Stack</Link></li>
              <li><Link to="/career/web-developer" className="hover:text-[#0D2B6E]">Web Developer</Link></li>
              <li><Link to="/career/cloud-engineer" className="hover:text-[#0D2B6E]">Cloud Engineer</Link></li>
              <li><Link to="/career/project-manager" className="hover:text-[#0D2B6E]">Project Manager</Link></li>
              <li><Link to="/career/game-developer" className="hover:text-[#0D2B6E]">Game Developer</Link></li>
              <li><Link to="/careers" className="text-[#3BAB35] font-medium mt-1 inline-block">See all Career Accelerators</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Job By Places</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/jobs/delhi" className="hover:text-[#0D2B6E]">Jobs in Delhi</Link></li>
              <li><Link to="/jobs/mumbai" className="hover:text-[#0D2B6E]">Jobs in Mumbai</Link></li>
              <li><Link to="/jobs/bangalore" className="hover:text-[#0D2B6E]">Jobs in Bangalore</Link></li>
              <li><Link to="/jobs/jaipur" className="hover:text-[#0D2B6E]">Jobs in Jaipur</Link></li>
              <li><Link to="/jobs/kolkata" className="hover:text-[#0D2B6E]">Jobs in Kolkata</Link></li>
              <li><Link to="/jobs/hyderabad" className="hover:text-[#0D2B6E]">Jobs in Hyderabad</Link></li>
              <li><Link to="/jobs" className="text-[#3BAB35] font-medium mt-1 inline-block">View all Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Jobs by Stream</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/stream/marketing" className="hover:text-[#0D2B6E]">Marketing Jobs</Link></li>
              <li><Link to="/stream/content-writing" className="hover:text-[#0D2B6E]">Content Writing Jobs</Link></li>
              <li><Link to="/stream/web-development" className="hover:text-[#0D2B6E]">Web Development Jobs</Link></li>
              <li><Link to="/stream/sales" className="hover:text-[#0D2B6E]">Sales Jobs</Link></li>
              <li><Link to="/stream/finance" className="hover:text-[#0D2B6E]">Finance Jobs</Link></li>
              <li><Link to="/stream/digital-marketing" className="hover:text-[#0D2B6E]">Digital Marketing Jobs</Link></li>
              <li><Link to="/jobs" className="text-[#3BAB35] font-medium mt-1 inline-block">View all Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Placement Guarantee Courses</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/course/full-stack" className="hover:text-[#0D2B6E]">Full Stack Development</Link></li>
              <li><Link to="/course/data-science" className="hover:text-[#0D2B6E]">Data Science</Link></li>
              <li><Link to="/course/hr" className="hover:text-[#0D2B6E]">Human Resource Management</Link></li>
              <li><Link to="/course/digital-marketing" className="hover:text-[#0D2B6E]">Digital Marketing</Link></li>
              <li><Link to="/course/electric-vehicle" className="hover:text-[#0D2B6E]">Electric Vehicle</Link></li>
              <li><Link to="/course/ui-ux" className="hover:text-[#0D2B6E]">UI/UX Design</Link></li>
              <li><Link to="/courses" className="text-[#3BAB35] font-medium mt-1 inline-block">View all Jobs</Link></li>
            </ul>
          </div>
        </div>

        {/* App Store Buttons */}
        <div className="flex gap-4 border-t border-gray-100 pt-8 mb-8">
          <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341c-.023-2.909 2.37-4.305 2.477-4.375-1.349-1.977-3.44-2.247-4.187-2.285-1.78-.182-3.483 1.047-4.398 1.047-.916 0-2.31-1.01-3.774-.982-1.91.028-3.665 1.112-4.646 2.825-1.984 3.447-.508 8.551 1.433 11.365.952 1.385 2.062 2.923 3.565 2.868 1.434-.055 1.986-.924 3.705-.924 1.72 0 2.217.924 3.733.896 1.545-.027 2.498-1.408 3.444-2.791 1.101-1.608 1.554-3.167 1.577-3.249-.033-.016-3.097-1.189-3.123-4.383zM14.686 6.386c.783-.951 1.31-2.268 1.166-3.586-1.134.046-2.502.756-3.303 1.706-.638.748-1.272 2.083-1.103 3.377 1.265.098 2.536-.615 3.24-1.497z"/></svg>
            <div className="text-left"><div className="text-[10px] leading-none">Download on the</div><div className="text-sm font-semibold leading-none mt-1">App Store</div></div>
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186a1.982 1.982 0 0 1-.58-.87A2.062 2.062 0 0 1 3 20.662V3.338c0-.23.01-.453.03-.654.041-.355.23-.72.579-1.07zm11.597 8.948l3.65-2.096c1.644-.94 1.644-2.484 0-3.424l-3.65-2.095-5.91 5.91 5.91 5.908zM14.07 15.34l-5.91-5.908-5.91 5.908 5.91 5.91 5.91-5.91zm1.136 1.137l-5.91 5.91 3.65 2.095c1.644.943 1.644 2.486 0 3.425l-3.65 2.095 5.91-5.91z"/></svg>
            <div className="text-left"><div className="text-[10px] leading-none">GET IT ON</div><div className="text-sm font-semibold leading-none mt-1">Google Play</div></div>
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-800">Terms</Link>
            <Link to="/privacy" className="hover:text-gray-800">Privacy</Link>
            <Link to="/cookies" className="hover:text-gray-800">Cookies</Link>
            <Link to="/legal" className="hover:text-gray-800">Legal</Link>
            <Link to="/shipping" className="hover:text-gray-800">Shipping & Delivery Policy</Link>
            <Link to="/refund" className="hover:text-gray-800">Refund & Cancellation Policy</Link>
          </div>
          <div className="text-center md:text-right">
            © {new Date().getFullYear()} Copyright. All Rights Reserved. Designed & Developed by Innovins.
          </div>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            {['youtube', 'linkedin', 'instagram', 'facebook'].map(social => (
              <a key={social} href={`#${social}`} className="text-gray-400 hover:text-gray-800">
                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">{social[0].toUpperCase()}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}