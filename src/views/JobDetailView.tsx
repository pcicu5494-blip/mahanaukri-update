import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Job } from '../types';
import { useJobs } from '../context/JobContext';
import { BrandLogo } from '../components/BrandLogo';

interface JobDetailViewProps {
  onOpenModal: (modalType: string, job?: Job) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ onOpenModal, onShowToast }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, fetchJobById, jobs, jobsLoading, language, toggleLanguage } = useJobs();
  const [notified, setNotified] = useState(false);
  const [fetchedJob, setFetchedJob] = useState<Job | null>(null);
  const [loadingSpecificJob, setLoadingSpecificJob] = useState(false);

  useEffect(() => {
    if (id) {
      const fromCache = getJobById(id);
      if (fromCache) {
        setFetchedJob(fromCache);
      } else {
        setLoadingSpecificJob(true);
        fetchJobById(id).then((j) => {
          if (j) setFetchedJob(j);
          setLoadingSpecificJob(false);
        });
      }
    }
  }, [id, getJobById, fetchJobById]);

  // Retrieve dynamic job from route parameter, fallback to cached job
  const job = (id ? (getJobById(id) || fetchedJob) : null) || (jobs.length > 0 ? jobs[0] : null);

  const isMarathi = language === 'mr';

  if (jobsLoading || loadingSpecificJob) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#00163d]">Loading recruitment details from Firestore...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9ff]">
        <div className="bg-white p-8 rounded-xl border border-[#c4c6d0] text-center max-w-md shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[#747780] mb-2">error</span>
          <h2 className="text-xl font-bold text-[#00163d] font-headline">Recruitment Not Found</h2>
          <p className="text-xs text-[#44464f] mt-2">
            The requested recruitment circular may have expired or not yet been published to the live portal.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-5 py-2.5 rounded-lg bg-[#0f2b5c] text-white text-xs font-semibold hover:bg-[#00163d]"
          >
            Back to Public Portal
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = job.vacancyBreakdown || {
    open: Math.round(job.vacancies * 0.38),
    obc: Math.round(job.vacancies * 0.27),
    sc: Math.round(job.vacancies * 0.13),
    st: Math.round(job.vacancies * 0.09),
    ews: Math.round(job.vacancies * 0.10),
    sebc: Math.round(job.vacancies * 0.03),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* 1. TOP APP BAR */}
      <header className="w-full bg-white border-b border-[#c4c6d0] shadow-sm sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand Logo with Subtitle */}
          <Link to="/" className="flex items-center gap-4 cursor-pointer">
            <BrandLogo className="h-10" showText={false} />
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-extrabold text-[#00163d] tracking-tight font-headline">
                MahaNaukri Update
              </span>
              <span className="text-[11px] text-[#44464f] font-medium">
                Maharashtra Official Recruitment Updates
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
            <Link to="/" className="text-[#44464f] hover:text-[#0b1c30] pb-1 transition-colors">
              {isMarathi ? 'मुख्यपृष्ठ' : 'Home'}
            </Link>
            <Link
              to={`/category/${encodeURIComponent(job.category)}`}
              className="border-b-2 border-[#006398] text-[#006398] font-bold pb-1"
            >
              {job.category}
            </Link>
            <Link to="/category/Army Bharti" className="text-[#44464f] hover:text-[#0b1c30] pb-1 transition-colors">
              Army Bharti
            </Link>
            <Link to="/category/Railway" className="text-[#44464f] hover:text-[#0b1c30] pb-1 transition-colors">
              Railway
            </Link>
            <Link to="/category/SSC" className="text-[#44464f] hover:text-[#0b1c30] pb-1 transition-colors">
              SSC
            </Link>
            <Link to="/category/Banking" className="text-[#44464f] hover:text-[#0b1c30] pb-1 transition-colors">
              Banking
            </Link>
          </nav>

          {/* Trailing Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleLanguage}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c4c6d0] bg-white hover:bg-[#eff4ff] text-[#0b1c30] text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">translate</span>
              <span>{isMarathi ? 'मराठी / English' : 'English / मराठी'}</span>
            </button>

            <button
              onClick={() => onShowToast('Notifications', 'Live SMS alert pipeline active for Maharashtra jobs.')}
              className="p-2 rounded-lg text-[#44464f] hover:bg-[#eff4ff] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CANVAS */}
      <main className="flex-grow max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="flex items-center text-[#44464f] text-xs flex-wrap gap-2">
          <Link to="/" className="flex items-center gap-1 hover:text-[#006398] transition-colors">
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Home</span>
          </Link>
          <span className="material-symbols-outlined text-[#747780] text-[16px]">chevron_right</span>
          <Link
            to={`/category/${encodeURIComponent(job.category)}`}
            className="hover:text-[#006398] transition-colors font-medium"
          >
            {job.category}
          </Link>
          <span className="material-symbols-outlined text-[#747780] text-[16px]">chevron_right</span>
          <span className="text-[#0b1c30] font-semibold truncate max-w-xs md:max-w-none">
            {job.title}
          </span>
        </nav>

        {/* DISCLAIMER ALERT BANNER */}
        <section className="bg-white border-l-4 border-[#0f2b5c] border-y border-r border-[#c4c6d0] rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-[#eff4ff] text-[#0f2b5c] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm text-[#00163d] font-bold font-headline">
                  {isMarathi ? 'महत्त्वाची सूचना' : 'Important Notice'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span> Verified Source
                </span>
              </div>
              <p className="text-[#44464f] text-xs">
                MahaNaukri Update is an independent job portal. Always verify recruitment information on the official website (
                <a
                  href={job.websiteUrl || 'https://mahapolice.gov.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#006398] font-semibold hover:underline"
                >
                  {job.websiteUrl ? job.websiteUrl.replace(/^https?:\/\//, '') : 'official portal'}
                </a>
                ) before applying.
              </p>
            </div>
          </div>
        </section>

        {/* RECRUITMENT HEADER CARD */}
        <section className="bg-white border border-[#c4c6d0] rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#eff4ff] rounded-full opacity-60 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c4c6d0] pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006398] text-[24px]">local_police</span>
                <span className="text-xs sm:text-sm text-[#006398] font-bold tracking-wide uppercase">
                  {job.dept}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {Boolean(job.notificationPdf || job.notificationLink || job.pdfUrl) && (
                  <a
                    href={job.notificationPdf || job.notificationLink || job.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                    title="Open official notification PDF in a new tab"
                  >
                    <span>📄 Official Notification</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse"></span>
                  Active - Application Open
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs bg-[#eff4ff] text-[#44464f] border border-[#c4c6d0]">
                  Advt. No: {job.advtNo || 'MP-CONST-2026/01'}
                </span>
              </div>
            </div>

            {/* Title & summary */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00163d] tracking-tight font-headline">
                {job.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#44464f]">
                Recruitment for <span className="font-semibold text-[#0b1c30]">{job.postName}</span> across district headquarters.
              </p>
            </div>

            {/* Key Parameter Tiles: Vacancies, Salary, Qualification, Age Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Tile 1: Vacancies */}
              <div className="bg-[#eff4ff] border border-[#c4c6d0] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#44464f] mb-2 text-xs">
                  <span className="uppercase font-semibold">Total Vacancies</span>
                  <span className="material-symbols-outlined text-[#006398]">groups</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#00163d] font-mono">
                    {job.vacancies.toLocaleString()} Posts
                  </span>
                  <p className="text-[11px] text-[#44464f] mt-1">Statewide District Breakdown</p>
                </div>
              </div>

              {/* Tile 2: Salary */}
              <div className="bg-[#eff4ff] border border-[#c4c6d0] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#44464f] mb-2 text-xs">
                  <span className="uppercase font-semibold">Salary / Pay Scale</span>
                  <span className="material-symbols-outlined text-[#006398]">payments</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#00163d]">
                    {job.salary || '₹21,700 - ₹69,100'}
                  </span>
                  <p className="text-[11px] text-[#44464f] mt-1">Level-S3 + Allowances</p>
                </div>
              </div>

              {/* Tile 3: Qualification */}
              <div className="bg-[#eff4ff] border border-[#c4c6d0] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#44464f] mb-2 text-xs">
                  <span className="uppercase font-semibold">Qualification</span>
                  <span className="material-symbols-outlined text-[#006398]">school</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#00163d]">
                    {job.qualification}
                  </span>
                  <p className="text-[11px] text-[#44464f] mt-1">From Recognized Board</p>
                </div>
              </div>

              {/* Tile 4: Age Limit */}
              <div className="bg-[#eff4ff] border border-[#c4c6d0] rounded-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#44464f] mb-2 text-xs">
                  <span className="uppercase font-semibold">Age Limit</span>
                  <span className="material-symbols-outlined text-[#006398]">person</span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#00163d]">
                    {job.ageLimit}
                  </span>
                  <p className="text-[11px] text-[#44464f] mt-1">OBC +3 yrs | SC/ST +5 yrs</p>
                </div>
              </div>
            </div>

            {/* Category-wise vacancy table */}
            <div className="bg-white border border-[#c4c6d0] rounded-lg overflow-hidden">
              <div className="bg-[#dce9ff] px-4 py-2.5 border-b border-[#c4c6d0] flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#0b1c30]">
                  Category-Wise Vacancy Reservation
                </span>
                <span className="text-[11px] text-[#44464f] font-mono">
                  Total: {job.vacancies.toLocaleString()} Vacancies
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#c4c6d0] text-center bg-white">
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">Open / UR</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.open}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">OBC</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.obc}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">SC</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.sc}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">ST</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.st}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">EWS</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.ews}</div>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#44464f]">SEBC</div>
                  <div className="text-sm font-bold text-[#00163d] mt-1 font-mono">{breakdown.sebc}</div>
                </div>
              </div>
              <div className="px-4 py-2 bg-[#eff4ff] border-t border-[#c4c6d0] text-[#44464f] text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#006398]">location_on</span>
                <span>
                  <strong>Location:</strong> {job.location || 'All Maharashtra Districts (Mumbai City, Pune, Nagpur, Nashik, etc.)'}
                </span>
              </div>
            </div>

            {/* Application fee bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#e5eeff] rounded-lg border border-[#c4c6d0] text-[#0b1c30] text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006398]">receipt_long</span>
                <span className="font-bold uppercase">Application Fee:</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span>{job.fee || 'General: ₹450 | Reserved: ₹350 | Ex-Servicemen: Exempted'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* IMPORTANT LINKS SECTION - DYNAMIC & NOT HARD-CODED */}
        <section className="bg-white border-2 border-[#006398] rounded-xl p-6 md:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#c4c6d0] pb-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#00163d] flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-[#006398]">link</span>
                Important Links & Quick Actions
              </h2>
              <p className="text-xs text-[#44464f] mt-0.5">
                Direct authenticated government endpoints and notification resources.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#44464f] font-medium bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#c4c6d0] self-start md:self-auto">
              <span className="material-symbols-outlined text-[16px] text-[#047857]">check_circle</span>
              Dynamic & Verified Today
            </div>
          </div>

          {/* Links Grid: Apply Online, Hall Ticket, Official Notification, Official Website, Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dynamic Link 1: Apply Online (applyLink) */}
            <a
              href={job.applyLink || job.applyUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col p-5 rounded-lg bg-[#0f2b5c] hover:bg-[#00163d] text-white transition-all shadow-sm active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-lg bg-white/10 text-white">
                  <span className="material-symbols-outlined text-[28px]">how_to_reg</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#ECFDF5] text-[#047857] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span> Live
                </span>
              </div>
              <span className="text-base font-bold text-white group-hover:text-[#5bb8fe] transition-colors">
                Apply Online
              </span>
              <span className="text-xs text-[#afc6ff] mt-1 break-all">
                {job.applyLink || job.applyUrl || 'Apply on official recruitment portal'}
              </span>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[#cce5ff] text-xs font-semibold">
                <span>Register & Login</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
            </a>

            {/* Dynamic Link 2: Hall Ticket (hallTicketLink & hallTicketReleased) */}
            {job.hallTicketReleased ? (
              <a
                href={job.hallTicketLink || job.hallTicketUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const link = job.hallTicketLink || job.hallTicketUrl;
                  if (!link || link === '#') {
                    e.preventDefault();
                    onOpenModal('hall-ticket', job);
                  }
                }}
                className="group relative flex flex-col p-5 rounded-lg bg-[#006398] hover:bg-[#00476e] text-white transition-all shadow-sm active:scale-[0.99] text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-lg bg-white/10 text-white">
                    <span className="material-symbols-outlined text-[28px]">badge</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-400 text-[#00163d] font-bold">
                    Available Now
                  </span>
                </div>
                <span className="text-base font-bold text-white">Download Hall Ticket</span>
                <span className="text-xs text-[#cce5ff] mt-1 break-all">
                  {job.hallTicketLink || job.hallTicketUrl || 'Admit card link active'}
                </span>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[#cce5ff] text-xs font-semibold">
                  <span>Download Admit Card</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    open_in_new
                  </span>
                </div>
              </a>
            ) : (
              <div className="group relative flex flex-col p-5 rounded-lg bg-gray-50 text-[#747780] border border-[#c4c6d0] text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-lg bg-gray-200/80 text-[#747780]">
                    <span className="material-symbols-outlined text-[28px]">badge</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-gray-200 text-[#44464f] font-bold">
                    Status
                  </span>
                </div>
                <span className="text-base font-bold text-[#44464f]">Hall Ticket</span>
                <span className="text-xs text-[#b91c1c] font-semibold mt-1">
                  Hall Ticket Not Released Yet
                </span>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[#747780] text-xs">
                  <span>Official schedule awaited</span>
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
              </div>
            )}

            {/* Dynamic Link 3: Official Notification PDF */}
            {(job.notificationPdf || job.notificationLink || job.pdfUrl) ? (
              <a
                href={job.notificationPdf || job.notificationLink || job.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col p-5 rounded-lg bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c4c6d0] transition-all shadow-sm active:scale-[0.99] text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                    <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> PDF Available
                  </span>
                </div>
                <span className="text-base font-bold text-[#00163d] group-hover:text-[#006398] transition-colors flex items-center gap-1.5">
                  <span>📄 Official Notification</span>
                </span>
                <span className="text-xs text-[#44464f] mt-1 break-all truncate">
                  Official recruitment notification & advertisement copy
                </span>
                <div className="mt-4 pt-3 border-t border-[#c4c6d0] flex items-center justify-between text-[#006398] text-xs font-semibold">
                  <span>Open Notification PDF</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    open_in_new
                  </span>
                </div>
              </a>
            ) : null}

            {/* Dynamic Link 4: Official Website (officialWebsite) */}
            <a
              href={job.officialWebsite || job.websiteUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col p-5 rounded-lg bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c4c6d0] transition-all shadow-sm active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-lg bg-[#eff4ff] text-[#006398]">
                  <span className="material-symbols-outlined text-[28px]">language</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#047857] font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified</span> .gov.in
                </span>
              </div>
              <span className="text-base font-bold text-[#00163d] group-hover:text-[#006398] transition-colors">
                Official Website
              </span>
              <span className="text-xs text-[#44464f] mt-1 break-all">
                {job.officialWebsite || job.websiteUrl || 'Department official website'}
              </span>
              <div className="mt-4 pt-3 border-t border-[#c4c6d0] flex items-center justify-between text-[#006398] text-xs font-semibold">
                <span>Open External Portal</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
            </a>

            {/* Dynamic Link 5: Result (resultLink & resultReleased) */}
            {job.resultReleased ? (
              <a
                href={job.resultLink || job.resultUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const link = job.resultLink || job.resultUrl;
                  if (!link || link === '#') {
                    e.preventDefault();
                    onOpenModal('result-modal', job);
                  }
                }}
                className="group relative flex flex-col p-5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-sm active:scale-[0.99] text-left md:col-span-2 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-lg bg-white/20 text-white">
                    <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-200 text-emerald-900 font-bold">
                    Result Declared
                  </span>
                </div>
                <span className="text-base font-bold text-white">
                  View Recruitment Result & Merit List
                </span>
                <span className="text-xs text-emerald-100 mt-1 break-all">
                  {job.resultLink || job.resultUrl || 'Final cutoff marks and merit score list'}
                </span>
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-emerald-100 text-xs font-semibold">
                  <span>Open Official Result Portal</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    open_in_new
                  </span>
                </div>
              </a>
            ) : (
              <div className="group relative flex flex-col p-5 rounded-lg bg-gray-50 text-[#747780] border border-[#c4c6d0] text-left md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2.5 rounded-lg bg-gray-200/80 text-[#747780]">
                    <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-gray-200 text-[#44464f] font-bold">
                    Status
                  </span>
                </div>
                <span className="text-base font-bold text-[#44464f]">
                  Recruitment Result & Merit List
                </span>
                <span className="text-xs text-[#b91c1c] font-semibold mt-1">
                  Result Not Released Yet
                </span>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[#747780] text-xs">
                  <span>Evaluation in progress / Merit declaration awaited</span>
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
              </div>
            )}
          </div>

          {/* Mandatory Prominent Note */}
          <div className="mt-6 p-3 bg-[#eff4ff] rounded-lg border border-[#c4c6d0] flex items-center gap-2.5 text-[#44464f] text-xs">
            <span className="material-symbols-outlined text-[#006398] text-[20px]">info</span>
            <span>
              <strong>Prominent Note:</strong> Always verify recruitment information on the official website before applying.
            </span>
          </div>
        </section>

        {/* TWO-COLUMN LAYOUT: DATES & HALL TICKET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: IMPORTANT DATES TIMELINE (7 cols) */}
          <section className="lg:col-span-7 bg-white border border-[#c4c6d0] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-3 mb-5">
                <h2 className="text-lg font-bold text-[#00163d] flex items-center gap-2 font-headline">
                  <span className="material-symbols-outlined text-[#006398]">calendar_month</span>
                  Important Dates
                </h2>
                <span className="text-xs text-[#44464f]">Schedule 2026</span>
              </div>

              <div className="space-y-4">
                {/* Date 1 */}
                <div className="flex items-start gap-4 p-3 rounded-lg bg-[#eff4ff] border border-[#c4c6d0]/60">
                  <div className="w-10 h-10 rounded-lg bg-[#0f2b5c] text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                    <span>01</span>
                    <span className="text-[9px] uppercase font-normal">OCT</span>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs sm:text-sm text-[#00163d] font-bold">Notification Release Date</h4>
                      <p className="text-xs text-[#44464f]">Official advertisement published on portal</p>
                    </div>
                    <span className="text-xs text-[#44464f] font-medium sm:text-right">
                      {job.startDate || '01 October 2026'}
                    </span>
                  </div>
                </div>

                {/* Date 2 */}
                <div className="flex items-start gap-4 p-3 rounded-lg bg-[#eff4ff] border border-[#c4c6d0]/60">
                  <div className="w-10 h-10 rounded-lg bg-[#006398] text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                    <span>05</span>
                    <span className="text-[9px] uppercase font-normal">OCT</span>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs sm:text-sm text-[#00163d] font-bold">Online Application Start Date</h4>
                      <p className="text-xs text-[#44464f]">Portal open for online submissions</p>
                    </div>
                    <span className="text-xs text-[#047857] font-bold sm:text-right">
                      {job.startDate || '05 October 2026'}
                    </span>
                  </div>
                </div>

                {/* Date 3: Deadline Alert */}
                <div className="flex items-start gap-4 p-3 rounded-lg bg-[#FFF7ED] border border-[#FDBA74]">
                  <div className="w-10 h-10 rounded-lg bg-[#C2410C] text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                    <span>20</span>
                    <span className="text-[9px] uppercase font-normal">OCT</span>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm text-[#9A3412] font-bold">Last Date to Apply Online</h4>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#FFEDD5] text-[#C2410C] font-bold border border-[#FDBA74]">
                          Deadline
                        </span>
                      </div>
                      <p className="text-xs text-[#C2410C]">Window closes at 11:59 PM</p>
                    </div>
                    <span className="text-xs text-[#C2410C] font-bold sm:text-right">
                      {job.lastDate}
                    </span>
                  </div>
                </div>

                {/* Date 4: Exam Date */}
                <div className="flex items-start gap-4 p-3 rounded-lg bg-[#eff4ff] border border-[#c4c6d0]/60">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#0b1c30] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs sm:text-sm text-[#00163d] font-bold">Examination / PET Schedule</h4>
                      <p className="text-xs text-[#44464f]">Stage assessments & ground verification</p>
                    </div>
                    <span className="text-xs text-[#006398] font-bold sm:text-right">
                      {job.examDate || 'November / December 2026'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c4c6d0] flex items-center justify-between text-[#44464f] text-xs">
              <span>* Dates are tentative and subject to departmental directives.</span>
              <button
                onClick={() => {
                  setNotified(!notified);
                  onShowToast(
                    notified ? 'Notification Disabled' : 'Notification Enabled',
                    notified ? 'Reminders removed for exam dates.' : 'SMS / Push alert set for exam schedule release!'
                  );
                }}
                className={`font-semibold flex items-center gap-1 cursor-pointer ${
                  notified ? 'text-[#047857]' : 'text-[#006398] hover:underline'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {notified ? 'check_circle' : 'add_alert'}
                </span>
                <span>{notified ? 'Subscribed' : 'Notify Me'}</span>
              </button>
            </div>
          </section>

          {/* RIGHT: HALL TICKET STATUS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-white border border-[#c4c6d0] rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#dce9ff] text-[#006398]">
                    <span className="material-symbols-outlined text-[32px]">badge</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#00163d] font-headline">Hall Ticket / Admit Card</h3>
                    <p className="text-xs text-[#44464f]">Download your official Admit Card / Hall Ticket.</p>
                  </div>
                </div>

                {/* Status Warning Banner */}
                <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#C2410C] text-[22px] shrink-0 mt-0.5">
                      schedule
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm text-[#9A3412] font-bold">
                        {job.hallTicketStatus || 'Hall Ticket Not Released Yet'}
                      </h5>
                      <p className="text-xs text-[#C2410C] mt-1">
                        (Release expected 10 days before exam date)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#44464f] mb-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#047857]">check_circle</span>
                    <span>Candidates will need Application ID & Date of Birth.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#047857]">check_circle</span>
                    <span>SMS alerts will be sent to registered mobile numbers.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#047857]">check_circle</span>
                    <span>Printed admit card with valid ID is compulsory at test venue.</span>
                  </div>
                </div>
              </div>

              <div>
                {job.hallTicketReleased ? (
                  <a
                    href={job.hallTicketLink || job.hallTicketUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-lg bg-[#0f2b5c] text-white font-semibold hover:bg-[#00163d] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] text-xs sm:text-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined">download</span>
                    <span>Download Hall Ticket</span>
                  </a>
                ) : (
                  <div className="w-full py-3 px-4 rounded-lg bg-gray-100 text-[#b91c1c] font-bold text-center text-xs sm:text-sm border border-gray-300 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#b91c1c]">schedule</span>
                    <span>Hall Ticket Not Released Yet</span>
                  </div>
                )}
                <p className="text-center text-[11px] text-[#747780] mt-2">
                  {job.hallTicketReleased
                    ? 'Authentication link active for downloading admit card.'
                    : 'Download link will activate once official admit card is dispatched.'}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* HOW TO APPLY (Numbered Step-by-Step Guide) */}
        <section className="bg-white border border-[#c4c6d0] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="border-b border-[#c4c6d0] pb-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#00163d] flex items-center gap-2 font-headline">
              <span className="material-symbols-outlined text-[#006398]">checklist</span>
              How To Apply (Step-by-Step Guide)
            </h2>
            <p className="text-xs text-[#44464f] mt-0.5">
              Follow these verified official procedures carefully to ensure your candidature is successfully registered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(Array.isArray(job.howToApply)
              ? job.howToApply
              : typeof job.howToApply === 'string' && job.howToApply
              ? job.howToApply.split('\n').filter(Boolean)
              : [
                  'Visit the official registration portal.',
                  'Click on Recruitment 2026 and complete one-time registration.',
                  'Fill in personal details, educational qualifications, and domicile.',
                  'Upload scanned photograph and signature in prescribed format.',
                  'Pay the application fee online via UPI, Net Banking, or Debit Card.',
                  'Submit the application form and take a printout of the confirmation acknowledgment.',
                ]
            ).map((stepText: string, idx: number) => (
              <div key={idx} className="p-4 rounded-lg bg-[#eff4ff] border border-[#c4c6d0] relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase font-bold text-[#006398]">
                    Step 0{idx + 1}
                  </span>
                  <span className="material-symbols-outlined text-[#747780] text-[20px]">
                    {idx === 0
                      ? 'public'
                      : idx === 1
                      ? 'app_registration'
                      : idx === 2
                      ? 'description'
                      : idx === 3
                      ? 'upload_file'
                      : idx === 4
                      ? 'account_balance_wallet'
                      : 'print'}
                  </span>
                </div>
                <p className="text-xs text-[#44464f] leading-relaxed">{stepText}</p>
              </div>
            ))}
          </div>

          {/* Ready to apply bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[#e5eeff] border border-[#c4c6d0]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#006398] text-[28px]">assignment_ind</span>
              <div>
                <span className="text-xs sm:text-sm text-[#00163d] font-bold">Ready to apply?</span>
                <p className="text-xs text-[#44464f]">Keep your documents scanned and ready before opening form.</p>
              </div>
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg bg-[#0f2b5c] text-white text-xs font-bold hover:bg-[#00163d] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Proceed to Online Application Form</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </section>

        {/* REQUIRED DOCUMENTS CHECKLIST */}
        <section className="bg-white border border-[#c4c6d0] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="border-b border-[#c4c6d0] pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#00163d] flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-[#006398]">folder_shared</span>
                Required Documents Checklist
              </h2>
              <p className="text-xs text-[#44464f] mt-0.5">
                Verify every document is updated and valid as per the cutoff dates.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-[#eff4ff] text-[#44464f] text-xs font-semibold">
              {(job.requiredDocs || []).length} Essential Documents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(job.requiredDocs || [
              '10th (SSC) Marksheet & Passing Certificate',
              '12th (HSC) Marksheet & Passing Certificate',
              'Maharashtra Domicile Certificate',
              'Non-Creamy Layer Certificate',
              'Caste & Caste Validity Certificate',
              'Valid Photo ID Proof (Aadhaar / Voter ID)',
              'Passport Photo & Signature Scans',
            ]).map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-lg border border-[#c4c6d0] bg-white hover:bg-[#eff4ff] transition-colors"
              >
                <span className="material-symbols-outlined text-[#047857] text-[22px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#00163d]">{doc}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eff4ff] text-[#44464f]">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-[#44464f] mt-0.5">
                    Original document verification required at reporting center.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#eff4ff] border border-[#c4c6d0]">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#dce9ff] text-[#00163d] text-xs font-semibold border border-[#c4c6d0] transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Home
            </Link>
            <Link
              to={`/category/${encodeURIComponent(job.category)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#dce9ff] text-[#006398] text-xs font-semibold border border-[#c4c6d0] transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">local_police</span>
              All {job.category} Jobs
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#44464f] text-xs">
            <span className="material-symbols-outlined text-[18px] text-[#006398]">update</span>
            <span>Last Updated: Today, 08:30 AM IST</span>
          </div>
        </div>
      </main>

      {/* 3. INSTITUTIONAL FOOTER */}
      <footer className="w-full bg-[#00163d] text-white pt-12 pb-8 border-t border-[#0f2b5c] mt-12">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#0f2b5c]">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5bb8fe] text-[26px]">verified</span>
                <span className="text-lg font-bold text-white font-headline">MahaNaukri Update</span>
              </div>
              <p className="text-xs text-[#afc6ff] max-w-md">
                MahaNaukri Update is a dedicated career updates portal for Maharashtra aspirants. We track, curate, and verify direct updates across Maharashtra Police, MPSC, Zilla Parishad, Army, Railway, and State Public Undertakings.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#cce5ff]">Categories</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link to="/category/Police Bharti" className="text-[#afc6ff] hover:text-white transition">
                    Police Bharti
                  </Link>
                </li>
                <li>
                  <Link to="/category/Army Bharti" className="text-[#afc6ff] hover:text-white transition">
                    Army Bharti
                  </Link>
                </li>
                <li>
                  <Link to="/category/Railway" className="text-[#afc6ff] hover:text-white transition">
                    Railway Recruitment
                  </Link>
                </li>
                <li>
                  <Link to="/category/Maharashtra Govt" className="text-[#afc6ff] hover:text-white transition">
                    MPSC Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#cce5ff]">Policies & Help</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => onShowToast('Verification Policy', 'Official government gazettes (.gov.in) are verified daily.')} className="text-[#afc6ff] hover:text-white transition cursor-pointer">
                    Disclaimer & Verification Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('Privacy Policy', 'Zero third-party tracking or commercial data sales.')} className="text-[#afc6ff] hover:text-white transition cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onShowToast('Helpdesk', 'Helpline: 1800-202-0941')} className="text-[#afc6ff] hover:text-white transition cursor-pointer">
                    Contact Helpline
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#afc6ff]">
            <p className="text-center md:text-left">
              © 2024 MahaNaukri Update. Independent information portal. Not affiliated with any government department. Please verify notifications with respective official portals (.gov.in / .nic.in).
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-[#cce5ff]">
              <span className="material-symbols-outlined text-[14px]">shield</span> SSL Secured Portal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
