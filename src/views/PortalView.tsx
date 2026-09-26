import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { BrandLogo } from '../components/BrandLogo';

interface PortalViewProps {
  onOpenModal: (modalType: string, job?: Job) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const PortalView: React.FC<PortalViewProps> = ({ onOpenModal, onShowToast }) => {
  const navigate = useNavigate();
  const { category: routeCategory } = useParams<{ category?: string }>();
  const { jobs, language, toggleLanguage } = useJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync category from route parameter if present
  useEffect(() => {
    if (routeCategory) {
      const decoded = decodeURIComponent(routeCategory);
      setSelectedCategory(decoded);
    } else {
      setSelectedCategory('All');
    }
  }, [routeCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      navigate('/');
    } else {
      navigate(`/category/${encodeURIComponent(cat)}`);
    }
    const el = document.getElementById('jobsSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToLatestJobs = () => {
    const el = document.getElementById('jobsSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter jobs based on search & category (Strictly published jobs only)
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Only jobs with status = "published" should appear on the public website
      if (job.status !== 'published') return false;

      const matchesCat =
        selectedCategory === 'All' ||
        job.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Govt Jobs' && job.category === 'Maharashtra Govt') ||
        (selectedCategory === 'Government Jobs' && job.category === 'Maharashtra Govt');

      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const deptName = (job.department || job.dept || '').toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        deptName.includes(q) ||
        job.postName.toLowerCase().includes(q) ||
        job.qualification.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      );
    });
  }, [jobs, selectedCategory, searchQuery]);

  const isMarathi = language === 'mr';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* 1. TOP NOTICE / TICKER STRIP */}
      <div className="bg-[#0f2b5c] text-white text-xs py-1.5 px-4 border-b border-[#afc6ff]/20">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Disclaimer & Ticker */}
          <div className="flex items-center gap-3 overflow-hidden w-full md:w-auto">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#541900] text-[#fb641c] font-semibold uppercase text-[10px] tracking-wider shrink-0 border border-[#fb641c]/30">
              <span className="material-symbols-outlined text-[13px] fill-icon">campaign</span>
              {isMarathi ? 'सूचना' : 'Alert'}
            </span>
            <div className="overflow-hidden relative w-full md:max-w-2xl text-[12px] text-[#eff4ff] font-medium">
              <div className="animate-marquee gap-8">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5bb8fe]"></span>
                  {isMarathi
                    ? 'सूचना: महा नोकरी अपडेट ही एक स्वतंत्र नोकरी माहिती वेबसाइट आहे, अधिकृत शासकीय वेबसाइट नाही. कृपया अधिकृत पोर्टलवर खात्री करा.'
                    : 'Notice: MahaNaukri Update is an independent job information website and NOT an official government website. Always verify on official portals.'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fb641c]"></span>
                  {isMarathi
                    ? 'महाराष्ट्र पोलीस शिपाई भरती २०२६ जाहिरात प्रसिद्ध • रेल्वे RRB NTPC ११,५५८ पदे अर्ज सुरू'
                    : 'Maharashtra Police Constable 2026 Notification Out • Railway RRB NTPC 11,558 Posts Apply Started'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5bb8fe]"></span>
                  {isMarathi
                    ? 'सूचना: महा नोकरी अपडेट ही एक स्वतंत्र नोकरी माहिती वेबसाइट आहे. कृपया अधिकृत पोर्टलवर खात्री करा.'
                    : 'Notice: MahaNaukri Update is an independent job information website and NOT an official government website. Always verify on official portals.'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fb641c]"></span>
                  {isMarathi
                    ? 'महाराष्ट्र पोलीस शिपाई भरती २०२६ जाहिरात प्रसिद्ध • रेल्वे RRB NTPC ११,५५८ पदे अर्ज सुरू'
                    : 'Maharashtra Police Constable 2026 Notification Out • Railway RRB NTPC 11,558 Posts Apply Started'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Action Strip */}
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs">
            <button
              onClick={toggleLanguage}
              className="hover:text-[#5bb8fe] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">translate</span>
              <span>{isMarathi ? 'मराठी (सक्रिय) / English' : 'English / मराठी'}</span>
            </button>
            <span className="text-white/30">|</span>
            <span className="text-[#eff4ff] flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
              {isMarathi ? 'सत्यापित पोर्टल माहिती' : 'Verified Portal Info'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAV BAR */}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-[#c4c6d0]">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo Branding */}
          <Link
            to="/"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="cursor-pointer"
          >
            <BrandLogo className="h-10" showText={false} />
          </Link>

          {/* Desktop Navigation Links - Fully Functional */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/"
              onClick={() => setSelectedCategory('All')}
              className={`pb-1 transition-colors ${
                selectedCategory === 'All'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'मुख्यपृष्ठ' : 'Home'}
            </Link>

            <button
              onClick={() => handleSelectCategory('Police Bharti')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'Police Bharti'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'पोलीस भरती' : 'Police Bharti'}
            </button>

            <button
              onClick={() => handleSelectCategory('Army Bharti')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'Army Bharti'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'आर्मी भरती' : 'Army Bharti'}
            </button>

            <button
              onClick={() => handleSelectCategory('Railway')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'Railway'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'रेल्वे भरती' : 'Railway'}
            </button>

            <button
              onClick={() => handleSelectCategory('SSC')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'SSC'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              SSC
            </button>

            <button
              onClick={() => handleSelectCategory('Banking')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'Banking'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'बँकिंग' : 'Banking'}
            </button>

            <button
              onClick={() => handleSelectCategory('Maharashtra Govt')}
              className={`pb-1 transition-colors cursor-pointer ${
                selectedCategory === 'Maharashtra Govt' || selectedCategory === 'Govt Jobs' || selectedCategory === 'Government Jobs'
                  ? 'border-b-2 border-[#006398] text-[#006398]'
                  : 'text-[#44464f] hover:text-[#0b1c30]'
              }`}
            >
              {isMarathi ? 'शासकीय नोकऱ्या' : 'Government Jobs'}
            </button>

            <button
              onClick={handleScrollToLatestJobs}
              className="text-[#44464f] hover:text-[#006398] pb-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>{isMarathi ? 'नवीन नोकऱ्या' : 'Latest Jobs'}</span>
            </button>
          </nav>

          {/* Trailing Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const searchEl = document.getElementById('portal-search-input');
                if (searchEl) {
                  searchEl.focus();
                  searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="inline-flex items-center gap-1.5 bg-[#006398] hover:bg-[#00476e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>{isMarathi ? 'शोध' : 'Search'}</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-[#00163d] p-1.5 rounded hover:bg-[#eff4ff]"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#c4c6d0] bg-white px-6 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => {
                setSelectedCategory('All');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm font-semibold text-[#006398]"
            >
              {isMarathi ? 'मुख्यपृष्ठ' : 'Home'}
            </Link>
            <button
              onClick={() => {
                handleSelectCategory('Police Bharti');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              {isMarathi ? 'पोलीस भरती' : 'Police Bharti'}
            </button>
            <button
              onClick={() => {
                handleSelectCategory('Army Bharti');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              {isMarathi ? 'आर्मी भरती' : 'Army Bharti'}
            </button>
            <button
              onClick={() => {
                handleSelectCategory('Railway');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              {isMarathi ? 'रेल्वे भरती' : 'Railway'}
            </button>
            <button
              onClick={() => {
                handleSelectCategory('SSC');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              SSC
            </button>
            <button
              onClick={() => {
                handleSelectCategory('Banking');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              {isMarathi ? 'बँकिंग भरती' : 'Banking'}
            </button>
            <button
              onClick={() => {
                handleSelectCategory('Maharashtra Govt');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm text-[#44464f] hover:text-[#0b1c30]"
            >
              {isMarathi ? 'महाराष्ट्र शासकीय नोकऱ्या' : 'Government Jobs'}
            </button>
            <button
              onClick={() => {
                handleScrollToLatestJobs();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-sm font-semibold text-[#006398]"
            >
              {isMarathi ? 'नवीन नोकऱ्या' : 'Latest Jobs'}
            </button>
          </div>
        )}
      </header>

      {/* 3. MAIN PUBLIC CANVAS */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* HERO SEARCH & PROMINENT HEADER SECTION */}
        <section className="relative rounded-xl bg-white border border-[#c4c6d0] p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#cce5ff]/30 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#d3e4fe]/50 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] border border-[#c4c6d0]/60 text-[#006398] text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-[#006398]">verified_user</span>
              <span>
                {isMarathi
                  ? '१००% अधिकृत शासकीय भरती जाहिराती'
                  : '100% Verified Government Recruitment Circulars'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#00163d] tracking-tight font-headline">
              {isMarathi ? 'नवीन शासकीय नोकरीच्या जाहिराती' : 'Latest Government Job Updates'}
            </h1>

            <p className="text-sm sm:text-base text-[#44464f] max-w-2xl mx-auto font-medium">
              Police Bharti • Army Bharti • Railway • SSC • Banking • Maharashtra Govt Jobs
            </p>

            {/* Prominent Search Bar */}
            <div className="pt-2">
              <div className="relative flex items-center shadow-sm rounded-lg border-2 border-[#00163d]/20 focus-within:border-[#006398] bg-white transition-all">
                <span className="material-symbols-outlined text-[#747780] ml-4 text-2xl">search</span>
                <input
                  id="portal-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isMarathi
                      ? 'विभाग, पात्रता किंवा पदाचे नाव शोधा (उदा. 12th Pass, Police, Railway)...'
                      : 'Search Jobs by Department, Qualification, or Post (e.g. 12th Pass, Police, Railway)...'
                  }
                  className="w-full py-3.5 pl-3 pr-28 text-[#0b1c30] text-sm bg-transparent border-none focus:outline-none placeholder:text-[#747780]/70"
                />
                <button
                  onClick={handleScrollToLatestJobs}
                  className="absolute right-2 px-5 py-2 rounded-lg bg-[#0f2b5c] text-white text-xs font-semibold hover:bg-[#00163d] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isMarathi ? 'शोधा' : 'Search'}</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-[#44464f] font-semibold mr-1">
                {isMarathi ? 'लोकप्रिय फिल्टर्स:' : 'Popular Filters:'}
              </span>
              <button
                onClick={() => setSearchQuery('10th Pass')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                10th Pass
              </button>
              <button
                onClick={() => setSearchQuery('12th Pass')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                12th Pass
              </button>
              <button
                onClick={() => setSearchQuery('Graduate')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                Graduate
              </button>
              <button
                onClick={() => setSearchQuery('Engineering')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                Engineering
              </button>
              <button
                onClick={() => setSearchQuery('Maharashtra Police')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                Maharashtra Police
              </button>
              <button
                onClick={() => setSearchQuery('Railway RRB')}
                className="px-3 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors border border-[#c4c6d0]/50 cursor-pointer"
              >
                Railway RRB
              </button>
              <button
                onClick={() => setSearchQuery('')}
                className="px-2.5 py-1 rounded bg-[#cce5ff]/50 hover:bg-[#cce5ff] text-[#001d31] transition-colors font-medium cursor-pointer"
              >
                {isMarathi ? 'साफ करा' : 'Clear'}
              </button>
            </div>
          </div>
        </section>

        {/* 4. EXPLORE JOBS BY RECRUITMENT CATEGORY (6 Bento Cards) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#00163d] flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-[#006398]">grid_view</span>
                {isMarathi ? 'भरती विभागानुसार नोकऱ्या पहा' : 'Explore Jobs by Recruitment Category'}
              </h2>
              <p className="text-xs text-[#44464f]">
                {isMarathi
                  ? 'सक्रिय रिक्त पदे, अभ्यासक्रम आणि ऑनलाइन अर्ज थेट उपलब्ध'
                  : 'Instant access to active vacancies, syllabus, and online application forms'}
              </p>
            </div>
            <span className="text-xs text-[#747780] font-medium hidden sm:inline-block">
              {isMarathi ? 'दर १५ मिनिटांनी अद्यतनित' : 'Updated every 15 minutes'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Police Bharti */}
            <div
              onClick={() => handleSelectCategory('Police Bharti')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">local_police</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'महाराष्ट्र पोलीस भरती' : 'Police Bharti'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">Maharashtra State Police, SRPF & Drivers</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">15,400+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Card 2: Army Bharti */}
            <div
              onClick={() => handleSelectCategory('Army Bharti')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">military_tech</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'आर्मी अग्निवीर भरती' : 'Army Bharti'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">Agniveer & Commissioned Officers</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">24,000+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Card 3: Railway Jobs */}
            <div
              onClick={() => handleSelectCategory('Railway')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">train</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Closing Soon
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'रेल्वे भरती (RRB)' : 'Railway Jobs'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">RRB NTPC, Group D & ALP Recruitment</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">32,500+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Card 4: SSC Jobs */}
            <div
              onClick={() => handleSelectCategory('SSC')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">assignment</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'कर्मचारी निवड आयोग (SSC)' : 'SSC Jobs'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">CGL, CHSL, GD Constable & MTS</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">18,200+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Card 5: Banking Jobs */}
            <div
              onClick={() => handleSelectCategory('Banking')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'बँक भरती' : 'Banking Jobs'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">IBPS, SBI PO & Clerk, RBI Assistant</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">9,800+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Card 6: Maharashtra Govt Jobs */}
            <div
              onClick={() => handleSelectCategory('Maharashtra Govt')}
              className="group cursor-pointer bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00163d] group-hover:bg-[#0f2b5c] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">location_city</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0b1c30] group-hover:text-[#006398] transition-colors font-headline">
                {isMarathi ? 'महाराष्ट्र शासकीय भरती' : 'Government Jobs'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">MPSC, Talathi, Zilla Parishad, Aarogya</p>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0]/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#00163d] font-mono">12,100+ Posts</span>
                <span className="text-[#006398] font-medium flex items-center group-hover:translate-x-1 transition-transform">
                  {isMarathi ? 'नोकऱ्या पहा' : 'Browse Jobs'}
                  <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HALL TICKET / ADMIT CARD UPDATES STRIP */}
        <section className="bg-gradient-to-r from-[#0f2b5c] to-[#1a4282] rounded-xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] uppercase bg-emerald-500 text-white font-bold inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {isMarathi ? 'उपलब्ध आहे' : 'Available Now'}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] uppercase bg-white/20 text-[#eff4ff] border border-white/20">
                  {isMarathi ? 'परीक्षा प्रवेशपत्र पोर्टल' : 'Exam Hall Ticket Portal'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-headline">
                {isMarathi ? 'प्रवेशपत्र / हॉल तिकीट अद्यतने' : 'Hall Ticket / Admit Card Updates'}
              </h2>
              <p className="text-[#eff4ff] text-xs sm:text-sm max-w-xl">
                {isMarathi
                  ? 'तुमचे अधिकृत प्रवेशपत्र / हॉल तिकीट उमेदवाराचा नोंदणी क्रमांक आणि जन्मतारीख वापरून परीक्षेपूर्वी डाउनलोड करा.'
                  : 'Download your official Admit Card / Hall Ticket directly via candidate registration number and DOB before the exam schedule date.'}
              </p>
            </div>

            {/* Quick Status and Action */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-[#00163d]/50 backdrop-blur border border-white/20 rounded-lg p-3 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-3 text-[#dce9ff]">
                  <span>MPSC Rajyaseva 2026:</span>
                  <span className="text-emerald-400 font-semibold">Available Now</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#dce9ff] mt-1.5">
                  <span>SSC GD Hall Ticket:</span>
                  <span className="text-white/70 font-normal">Not Released Yet</span>
                </div>
              </div>

              <button
                onClick={() => onOpenModal('hall-ticket')}
                className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#5bb8fe] text-[#001d31] hover:bg-[#93ccff] font-bold text-xs sm:text-sm transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">badge</span>
                <span>{isMarathi ? 'प्रवेशपत्र डाउनलोड करा' : 'Download Hall Ticket'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 6. LATEST JOBS & OPEN RECRUITMENTS */}
        <section className="space-y-4" id="jobsSection">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c4c6d0] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#00163d] font-headline">
                {isMarathi ? 'नवीन नोकरी भरती जाहिराती' : 'Latest Jobs & Open Recruitments'}
              </h2>
              <p className="text-xs text-[#44464f]">
                {isMarathi
                  ? 'थेट अधिकृत अर्ज लिंकसह १००% पडताळणी केलेल्या भरती'
                  : 'Verified job openings with direct departmental apply links'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
              {[
                { key: 'All', label: isMarathi ? 'सर्व नोकऱ्या' : 'All Jobs' },
                { key: 'Police Bharti', label: isMarathi ? 'पोलीस भरती' : 'Police Bharti' },
                { key: 'Army Bharti', label: isMarathi ? 'आर्मी भरती' : 'Army Bharti' },
                { key: 'Railway', label: isMarathi ? 'रेल्वे भरती' : 'Railway' },
                { key: 'SSC', label: 'SSC' },
                { key: 'Banking', label: isMarathi ? 'बँकिंग' : 'Banking' },
                { key: 'Maharashtra Govt', label: isMarathi ? 'महाराष्ट्र शासन' : 'Government Jobs' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleSelectCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === tab.key || (tab.key === 'Maharashtra Govt' && (selectedCategory === 'Govt Jobs' || selectedCategory === 'Government Jobs'))
                      ? 'bg-[#0f2b5c] text-white font-semibold shadow-sm'
                      : 'text-[#44464f] hover:bg-[#eff4ff]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid - EVERY CARD IS FULLY CLICKABLE */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white border border-[#c4c6d0] hover:border-[#006398] rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#44464f] mb-2">
                      <span className="font-medium text-[#006398] truncate max-w-[180px]">
                        {job.department || job.dept}
                      </span>
                      {job.hallTicketReleased ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span> Hall Ticket Out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Published
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#00163d] group-hover:text-[#006398] transition-colors font-headline">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#44464f] mt-1">
                      Post: <span className="font-medium text-[#0b1c30]">{job.postName}</span>
                    </p>

                    {/* 2x2 Data Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 bg-[#eff4ff] p-3 rounded-lg text-xs">
                      <div>
                        <span className="text-[#747780] block text-[11px]">
                          {isMarathi ? 'एकूण पदे' : 'Total Vacancies'}
                        </span>
                        <span className="font-semibold text-[#00163d] font-mono">
                          {job.vacancies.toLocaleString()} Vacancies
                        </span>
                      </div>
                      <div>
                        <span className="text-[#747780] block text-[11px]">
                          {isMarathi ? 'शैक्षणिक पात्रता' : 'Qualification'}
                        </span>
                        <span className="font-semibold text-[#00163d] truncate block" title={job.qualification}>
                          {job.qualification}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[#747780] block text-[11px]">
                          {isMarathi ? 'वयोमर्यादा' : 'Age Limit'}
                        </span>
                        <span className="font-semibold text-[#00163d]">{job.ageLimit}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[#747780] block text-[11px]">
                          {isMarathi ? 'अंतिम मुदत' : 'Last Date'}
                        </span>
                        <span className="font-semibold text-[#ba1a1a]">{job.lastDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div
                    className="mt-4 pt-3 border-t border-[#c4c6d0] flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/jobs/${job.id}`}
                      className="w-full py-2 rounded-lg bg-[#eff4ff] text-[#00163d] text-xs font-semibold hover:bg-[#dce9ff] transition-colors text-center cursor-pointer"
                    >
                      {isMarathi ? 'तपशील पहा' : 'View Details'}
                    </Link>
                    <button
                      onClick={() => onOpenModal('apply-modal', job)}
                      className="w-full py-2 rounded-lg bg-[#0f2b5c] text-white text-xs font-semibold hover:bg-[#00163d] transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{isMarathi ? 'अर्ज करा' : 'Apply Online'}</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#c4c6d0]">
              <span className="material-symbols-outlined text-4xl text-[#747780] mb-2">search_off</span>
              <h3 className="text-base font-bold text-[#00163d]">
                {isMarathi ? 'कोणतीही नोकरी आढळली नाही' : 'No Matching Job Openings Found'}
              </h3>
              <p className="text-xs text-[#44464f] mt-1">
                {isMarathi
                  ? 'कृपया शोध शब्द तपासा किंवा फिल्टर्स रीसेट करा.'
                  : "Try resetting filters or searching with general terms like '12th', 'Police', or 'Railway'."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  navigate('/');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#006398] text-white text-xs font-semibold cursor-pointer"
              >
                {isMarathi ? 'फिल्टर रीसेट करा' : 'Reset Search & Filters'}
              </button>
            </div>
          )}
        </section>

        {/* 7. VERIFICATION POLICY */}
        <section className="bg-[#eff4ff] border-l-4 border-[#0f2b5c] border-y border-r border-[#c4c6d0] rounded-r-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-[#00163d] text-white shrink-0">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#00163d] font-headline">
                  {isMarathi ? 'अधिकृत पोर्टल पडताळणी धोरण' : 'Official Portal Verification Policy'}
                </h4>
                <span className="text-[10px] bg-[#cce5ff] text-[#001d31] px-2 py-0.5 rounded font-bold uppercase">
                  Auth Stamp
                </span>
              </div>
              <p className="text-xs text-[#44464f] leading-relaxed">
                {isMarathi
                  ? 'महा नोकरी अपडेट केवळ शैक्षणिक व माहितीच्या उद्देशाने भरतीचे सारांश प्रदान करते. अर्ज फी भरणे किंवा फॉर्म जमा करण्यापूर्वी मूळ .gov.in किंवा .nic.in अधिकृत पोर्टलवरून जाहिरात क्रमांक, पात्रता व मुदत पडताळून घेणे अनिवार्य आहे.'
                  : 'MahaNaukri Update provides recruitment summaries for educational and informative assistance only. Candidates are strictly advised to double-check notification numbers, application fee structures, eligibility criteria, and deadlines directly with original government recruitment portals ending in .gov.in or .nic.in before submitting applications or fees.'}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-[#006398] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">policy</span> SSL Certified Data Sync
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> Daily Audit Timestamps
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. INSTITUTIONAL FOOTER */}
      <footer className="w-full bg-[#00163d] text-white pt-12 pb-8 px-6 mt-12 border-t border-[#0f2b5c]">
        <div className="max-w-[1240px] mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            {/* Col 1: Identity */}
            <div className="space-y-3">
              <Link
                to="/"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="cursor-pointer inline-block"
              >
                <BrandLogo className="h-9" showText={false} isDark={true} />
              </Link>
              <p className="text-xs text-[#afc6ff] leading-relaxed">
                The premier independent recruitment bulletin board for Maharashtra and Central Government opportunities. Designed for low latency, zero visual clutter, and instant alert delivery.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="p-1.5 rounded bg-[#0f2b5c] text-[#cce5ff]">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </span>
                <span className="text-xs text-[#afc6ff]">SSL Secured & Spam Free</span>
              </div>
            </div>

            {/* Col 2: Channels */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white font-headline">
                {isMarathi ? 'भरती विभाग' : 'Bharti Categories'}
              </h4>
              <ul className="text-xs space-y-2 text-[#afc6ff]">
                <li>
                  <button onClick={() => handleSelectCategory('Police Bharti')} className="hover:text-white transition cursor-pointer">
                    Police Bharti 2026
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategory('Army Bharti')} className="hover:text-white transition cursor-pointer">
                    Army Agniveer Recruitment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategory('Railway')} className="hover:text-white transition cursor-pointer">
                    Railway RRB Recruitment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategory('SSC')} className="hover:text-white transition cursor-pointer">
                    Staff Selection Commission (SSC)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategory('Banking')} className="hover:text-white transition cursor-pointer">
                    Banking & IBPS Exams
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategory('Maharashtra Govt')} className="hover:text-white transition cursor-pointer">
                    Government Jobs
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Candidate utilities */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white font-headline">
                {isMarathi ? 'उमेदवार उपयुक्त लिंक्स' : 'Candidate Links'}
              </h4>
              <ul className="text-xs space-y-2 text-[#afc6ff]">
                <li>
                  <button onClick={() => onOpenModal('hall-ticket')} className="hover:text-white transition cursor-pointer">
                    Hall Ticket / Admit Card
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenModal('result-modal')} className="hover:text-white transition cursor-pointer">
                    Exam Results & Merit Lists
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenModal('pdf-modal', jobs[0])} className="hover:text-white transition cursor-pointer">
                    Official Exam Syllabus PDF
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('Answer Key', 'Answer keys portal active for RRB & MPSC.')} className="hover:text-white transition cursor-pointer">
                    Answer Keys & Objections
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('Application Status', 'Track your application and exam status using your registration ID.')} className="hover:text-white transition cursor-pointer">
                    {isMarathi ? 'अर्ज स्थिती पडताळणी' : 'Application Status'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Support */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white font-headline">
                {isMarathi ? 'पडताळणी व मदत कक्ष' : 'Verification & Support'}
              </h4>
              <p className="text-xs text-[#afc6ff] leading-relaxed">
                Have questions regarding notification listings or advertisement guidelines? Contact the editorial desk:
              </p>
              <div className="text-xs text-[#5bb8fe] font-medium pt-1 space-y-0.5">
                <p>Email: helpdesk@mahanaukri.in</p>
                <p>Helpline: 1800-202-0941 (10 AM - 5 PM)</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={toggleLanguage}
                  className="text-xs px-3 py-1.5 rounded bg-[#0f2b5c] text-white border border-white/20 hover:bg-[#006398] transition cursor-pointer"
                >
                  {isMarathi ? 'Language: English' : 'भाषा बदला: मराठी'}
                </button>
              </div>
            </div>
          </div>

          {/* Legal / Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#afc6ff]">
            <p className="text-center md:text-left leading-relaxed max-w-4xl">
              © 2024 MahaNaukri Update. Independent information portal. Not affiliated with any government department. Please verify notifications with respective official portals (.gov.in / .nic.in).
            </p>
            <div className="flex items-center gap-4 shrink-0 font-medium">
              <button onClick={() => onShowToast('Disclaimer', 'Official verification against state gazettes is mandatory.')} className="hover:text-white transition cursor-pointer">
                Disclaimer & Policy
              </button>
              <span>•</span>
              <button onClick={() => onShowToast('Privacy', 'No candidate data is shared with third parties.')} className="hover:text-white transition cursor-pointer">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => onShowToast('Support Desk', 'Helpline: 1800-202-0941')} className="hover:text-white transition cursor-pointer">
                Contact Helpline
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
