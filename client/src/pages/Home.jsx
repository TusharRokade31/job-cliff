import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronRight, ChevronLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getBanners, getJobs, getEmployers, getBlogs } from '../services/api'; // Swapped getCourses with getBlogs
import JobCard from '../components/JobCard';
import aarambhPoster from '../../banner.png'; // Placeholder image for the hero section

const Home = () => {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      getJobs({ page: 1, limit: 6 }),
      getEmployers({ page: 1, limit: 6 }),
      getBlogs({ page: 1, limit: 6 }), // Fetching Blogs API here
      getBanners(),
    ]).then(([jobsRes, empRes, blogRes, bannerRes]) => {
      if (jobsRes.status === "fulfilled") { const d = jobsRes.value.data; setJobs(d?.data || d?.jobs || []); }
      if (empRes.status === "fulfilled") { const d = empRes.value.data; setCompanies(d?.data || d?.employers || []); }
      if (blogRes.status === "fulfilled") { const d = blogRes.value.data; setBlogs(d?.data || d?.blogs || []); }
      if (bannerRes.status === "fulfilled") { const d = bannerRes.value.data; setBanners(d?.data || d?.banners || []); }
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(search)}`);
    } else {
      navigate(`/jobs`);
    }
  };

  // Fallback data
  const defaultCards = [
    { image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800", title: "Search Nearby Jobs", desc: "Find companies offering jobs nearby" },
    { image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800", title: "Job Industry News", desc: "Explore latest news for Job Seekers and Providers" },
    { image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800", title: "Certification Courses", desc: "Learn in-demand skills and get certified" }
  ];

  const defaultCompanies = [
    { name: "Innovins softtech solutions pvt ltd", loc: "mumbai, india" },
    { name: "Care Infotech", loc: "MUMBAI, India" },
    { name: "AJ Strategy HR Solution", loc: "MUMBAI, India" },
    { name: "SET Academy", loc: "ULHASNAGAR, India" }
  ];

  const defaultBlogs = [
    { img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800", title: "10 Common Recruitment Challenges & Their Practical Solutions (2025)", date: "13/11/2025, 17:41:07", read: "1 min read" },
    { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", title: "8 Things to Take Care of While Applying for Internships and Jobs on JobCliff", date: "13/11/2025, 17:27:12", read: "1 min read" },
    { img: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=800", title: "How Small Businesses Can Build Talent with Interns", date: "13/11/2025, 18:24:31", read: "1 min read" }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafd] font-sans text-slate-800">
      
      {/* 1. HERO SECTION (Kept as is for structural integrity) */}
      <section className="max-w-8xl mx-auto px-30 py-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
            AARAMBH 5.0 - <span className="text-[#00529b]">Job Fair</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
            Register for AARAMBH 5.0 Job Fair and connect with multiple hiring companies in one place. 
            Get shortlisted before the event by filling the form today. Limited slots available — don't miss out!
          </p>
          <div className="bg-[#00529b] text-white px-5 py-4 rounded-lg text-sm font-semibold shadow-md border-l-[6px] border-[#6bbd45]">
            Register for AARAMBH 5.0 Job Fair and get access to multiple companies hiring freshers & graduates.
          </div>
          <div className="flex gap-4">
            <button className="bg-[#00529b] text-white px-9 py-3.5 rounded-full font-bold shadow-lg hover:bg-blue-800 transition">Register Now</button>
            <Link to="/jobs" className="border-2 border-[#00529b] text-[#00529b] px-9 py-3.5 rounded-full font-bold hover:bg-blue-50 transition inline-block">Explore Jobs</Link>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <img src={aarambhPoster} alt="Aarambh 5.0" className="w-[500px] rounded-2xl shadow-2xl border-4 border-white" />
        </div>
      </section>
       <section className="max-w-8xl mx-auto px-30 -mt-12 relative z-20">
        <div className="bg-white p-8 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-slate-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex-1 flex items-center border rounded-lg px-4 py-3 bg-white w-full">
              <Search size={20} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Job Title, Keyword or Company" 
                className="w-full outline-none text-sm text-slate-600 bg-transparent" 
              />
            </div>
            <div className="w-[1px] h-10 bg-slate-200 hidden md:block"></div>
            <div className="flex-1 flex items-center border rounded-lg px-4 py-3 bg-white w-full">
              <MapPin size={20} className="text-slate-400 mr-2" />
              <input type="text" placeholder="City, State, Zip Code or Remote" className="w-full outline-none text-sm text-slate-600 bg-transparent" />
            </div>
            <button type="submit" className="bg-[#00529b] text-white px-10 py-3 rounded-lg font-bold text-sm hover:bg-blue-800 transition">Find Jobs</button>
            <button type="button" className="border border-[#00529b] text-[#00529b] px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition">
              <span className="text-blue-500">✦</span> AI Search
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Job Type</label>
              <select className="w-full border rounded-lg p-3 text-sm text-slate-400 bg-white outline-none"><option>Select</option></select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Monthly Salary (₹ in Thousands)</label>
              <select className="w-full border rounded-lg p-3 text-sm text-slate-400 bg-white outline-none"><option>Select</option></select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Years of Experience</label>
              <select className="w-full border rounded-lg p-3 text-sm text-slate-400 bg-white outline-none"><option>Select years of experience</option></select>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT'S NEW (Banners Mapping) */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">What's <span className="text-[#00529b]">New</span></h2>
        <p className="text-slate-500 text-lg mb-12 max-w-3xl mx-auto">Unlock your potential with practical courses, job-ready skills, and real opportunities.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.length > 0 
            ? banners.slice(0, 3).map((b, i) => (
                <Card key={i} image={b.image || defaultCards[i % 3].image} title={b.title || defaultCards[i % 3].title} desc={b.description || defaultCards[i % 3].desc} />
              ))
            : defaultCards.map((c, i) => <Card key={i} image={c.image} title={c.title} desc={c.desc} />)
          }
        </div>
      </section>

      {/* 3. READY TO TRANSFORM (Matches Image 3) */}
      <section className="max-w-[1400px] mx-auto px-6 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Ready to <span className="text-[#6bbd45]">Transform Your Future?</span></h2>
            <p className="text-slate-500 text-sm max-w-2xl">Gain the skills, support, and opportunities you need to build a stable, dignified career — all through Vedanta's employment and training initiatives.</p>
            
            {/* Filter Pills */}
            <div className="flex gap-3 mt-6 flex-wrap">
              <button className="bg-[#6bbd45] text-white px-6 py-2 rounded-full text-sm font-semibold border border-[#6bbd45] shadow-sm">All</button>
              {['Remote Jobs', 'Part-Time', 'Freelance', 'Full-Time', 'Freshers'].map(tag => (
                <button key={tag} className="border border-slate-300 text-[#6bbd45] bg-white px-6 py-2 rounded-full text-sm font-medium hover:border-[#6bbd45] transition shadow-sm">{tag}</button>
              ))}
            </div>
          </div>
          
          <CustomViewAllButton to="/jobs" text="View All" color="green" />
        </div>

        {/* Dynamic Jobs Grid */}
        <div className="mb-24">
          {loading ? <Loader /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.slice(0, 6).map(job => <JobCard key={job._id || job.id} job={job} />)
              ) : (
                <p className="text-slate-500 col-span-full text-center py-10">No jobs found at the moment.</p>
              )}
            </div>
          )}
        </div>

        {/* 4. COMPANIES THAT ARE HIRING (Matches Image 2) */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Companies <span className="text-[#00529b]">That Are Hiring</span></h2>
              <p className="text-slate-500 text-sm max-w-xl">Discover opportunities with top employers who are actively building their teams and shaping the future.</p>
            </div>
            <CustomViewAllButton to="/employers" text="View All" color="blue" />
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto snap-x hide-scrollbar pb-6 pt-2">
              {loading ? <Loader /> : (
                companies.length > 0 
                  ? companies.map(c => <CompanyCard key={c._id || c.id} company={c} />)
                  : defaultCompanies.map((c, i) => <CompanyCard key={i} defaultName={c.name} defaultLoc={c.loc} />)
              )}
            </div>
            
            {/* Custom Bottom Slider Controls */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:bg-slate-50 transition"><ChevronLeft size={16}/></button>
              <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden flex">
                 <div className="w-1/3 h-full bg-[#00529b] rounded-full"></div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:bg-slate-50 transition"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSIGHTS & GUIDANCE / LATEST BLOGS (Matches Image 1) */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 bg-white border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="inline-block border border-slate-300 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-4">
              Latest Blogs
            </span>
            <h2 className="text-4xl font-bold text-slate-900">Insights & <span className="text-[#6bbd45]">Guidance</span></h2>
          </div>
          <CustomViewAllButton to="/blogs" text="View All" color="green" />
        </div>

        <div className="relative">
          <div className="flex gap-8 overflow-x-auto snap-x hide-scrollbar pb-8 pt-2">
            {blogs.length > 0 
              ? blogs.slice(0, 3).map((b, i) => (
                  <BlogCard key={b._id || b.id || i} blog={b} />
                ))
              : defaultBlogs.map((b, i) => <BlogCard key={i} blog={b} />)
            }
          </div>
          
          {/* Custom Bottom Dots */}
          <div className="flex items-center justify-center gap-2 mt-2">
             <div className="w-2 h-2 rounded-full bg-slate-200 transition-colors"></div>
             <div className="w-2 h-2 rounded-full bg-[#00529b] transition-colors"></div>
             <div className="w-2 h-2 rounded-full bg-slate-200 transition-colors"></div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

/* --- UI Subcomponents --- */

const CustomViewAllButton = ({ to = "/", text = "View All", color = "green" }) => {
  const isBlue = color === "blue";
  const borderColor = isBlue ? "border-[#00529b]" : "border-[#6bbd45]";
  const textColor = isBlue ? "text-[#00529b]" : "text-[#6bbd45]";
  const bgColor = isBlue ? "bg-[#00529b]" : "bg-[#6bbd45]";
 
  return (
    <Link
      to={to}
      // className={`flex items-center border-2 rounded-full overflow-hidden group hover:shadow-md transition bg-white ${borderColor}`}
      className="flex bg-[#6ebe49] items-center hover:bg-[#5aa838] text-white text-center text-sm font-semibold rounded-full px-1  py-1 transition-colors shadow-sm"
    >
      <span className={`px-8 py-2 me-5 font-bold rounded-full bg-white text-sm  ${textColor}`}>
        {text}
      </span>
      {/* <span
        className={`px-3 py-2 flex items-center justify-center text-white transition-colors ${bgColor}`}
      > */}
        <ChevronRight size={18} className='me-2' strokeWidth={2.5} />
      {/* </span> */}
    </Link>
  );
};

const Card = ({ image, title, desc }) => (
  <div className="relative group overflow-hidden rounded-2xl h-[300px] shadow-lg">
    <img src={image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-left">
      <h3 className="text-white text-2xl font-bold mb-1">{title}</h3>
      <p className="text-white/80 text-sm mb-6">{desc}</p>
      <div className="flex items-center gap-3 text-white font-bold text-sm">
        Explore Now <div className="bg-white rounded-full p-2 text-slate-900"><ArrowRight size={14} /></div>
      </div>
    </div>
  </div>
);

const CompanyCard = ({ company, defaultName, defaultLoc }) => {
  const name = company?.company_name || company?.name || defaultName;
  const loc = company?.location || company?.city || defaultLoc;
  const logo = company?.logo || null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition min-w-[320px] flex-shrink-0 snap-center flex flex-col justify-between">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-white border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          {logo ? (
            <img src={logo} alt={name} className="w-full h-full object-contain p-2" />
          ) : (
            <span className="text-slate-300 text-[10px] font-bold text-center leading-none">NO<br/>LOGO</span>
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{name}</h4>
          <p className="text-slate-500 text-xs flex items-center gap-1 uppercase tracking-wide">
            <MapPin size={12} className="text-slate-400" /> {loc}
          </p>
        </div>
      </div>
      <button className="w-full border-2 border-[#00529b] text-[#00529b] py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition mt-auto">
        View Details
      </button>
    </div>
  );
};

const BlogCard = ({ blog }) => {
  const img = blog?.image || blog?.img;
  const title = blog?.title;
  const date = blog?.date || "13/11/2025, 17:41:07";
  const read = blog?.read || "1 min read";

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 group min-w-[380px] flex-shrink-0 snap-center flex flex-col hover:shadow-md transition h-[360px]">
      <div className="h-48 overflow-hidden bg-slate-100 relative">
        {/* Simulating the rounded inner image border from your design */}
        <div className="absolute inset-2 overflow-hidden rounded-[20px]">
          <img src={img} className="w-full h-full object-cover" alt={title} />
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1 bg-white relative z-10 rounded-t-[24px] -mt-4">
        <h4 className="font-bold text-slate-800 text-lg leading-snug mb-4 group-hover:text-[#6bbd45] transition line-clamp-2 flex-1">
          {title}
        </h4>
        <div className="flex justify-between items-end mt-auto">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
            {date} | {read}
          </span>
          <button className="w-9 h-9 rounded-full bg-[#6bbd45] flex items-center justify-center text-white hover:bg-green-600 transition shadow-sm">
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Loader = () => (
  <div className="flex justify-center items-center py-16 w-full col-span-full">
    <div className="w-10 h-10 border-4 border-blue-100 border-t-[#00529b] rounded-full animate-spin"></div>
  </div>
);

export default Home;