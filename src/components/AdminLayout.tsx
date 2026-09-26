import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { BrandLogo } from './BrandLogo';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeCategory,
  onSelectCategory,
  onShowToast,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobs, logoutAdmin, adminUser } = useJobs();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  // Settings states
  const [autoArchive, setAutoArchive] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [watermarkPdf, setWatermarkPdf] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    onShowToast('Session Ended', 'Signed out from Firebase Authentication.');
    navigate('/admin/login', { replace: true });
  };

  const isDashboard = location.pathname === '/admin/dashboard';
  const isAllJobs = location.pathname === '/admin/jobs';
  const isAddJob = location.pathname === '/admin/jobs/new';
  const isEditJob = location.pathname.startsWith('/admin/jobs/edit');

  const categories = [
    { name: 'Police Bharti', color: 'bg-blue-400' },
    { name: 'Army Bharti', color: 'bg-amber-400' },
    { name: 'Railway', color: 'bg-emerald-400' },
    { name: 'SSC', color: 'bg-purple-400' },
    { name: 'Banking', color: 'bg-indigo-400' },
    { name: 'Maharashtra Govt', color: 'bg-rose-400' },
  ];

  const handleCategoryClick = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    if (location.pathname !== '/admin/jobs') {
      navigate('/admin/jobs');
    }
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8f9ff] text-[#0b1c30]">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-[#0f2b5c] text-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40 border-b border-[#afc6ff]/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileSidebarOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-white font-headline">
              MAHANUKRI ADMIN
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-400/30 font-semibold">
              Live
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-semibold"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Logout</span>
        </button>
      </div>

      {/* ADMIN SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0f2b5c] text-[#afc6ff] border-r border-[#c4c6d0]/20 flex flex-col justify-between shrink-0 z-50 transform transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="bg-white p-1.5 rounded-lg border border-[#c4c6d0] shrink-0">
              <BrandLogo className="h-8" showText={false} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-headline tracking-tight">
                MahaNaukri Admin
              </h2>
              <p className="text-[10px] text-[#afc6ff]/80 font-medium">
                Recruitment Desk Control
              </p>
            </div>
          </div>

          {/* Quick Action: Add New Job Button */}
          <Link
            to="/admin/jobs/new"
            onClick={() => setMobileSidebarOpen(false)}
            className="w-full bg-[#006398] hover:bg-[#00476e] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Add New Job</span>
          </Link>

          {/* Main Navigation Sidebar Links */}
          <nav className="space-y-1 text-xs">
            {/* 1. Dashboard */}
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
                isDashboard
                  ? 'bg-[#006398] text-white font-semibold shadow-sm'
                  : 'text-[#afc6ff] hover:bg-[#00163d] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span>Dashboard</span>
            </Link>

            {/* 2. All Jobs */}
            <Link
              to="/admin/jobs"
              onClick={() => setMobileSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
                isAllJobs
                  ? 'bg-[#006398] text-white font-semibold shadow-sm'
                  : 'text-[#afc6ff] hover:bg-[#00163d] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">work</span>
              <span>All Jobs</span>
              <span className="ml-auto bg-[#00163d] text-[10px] px-2 py-0.5 rounded font-mono text-[#cce5ff]">
                {jobs.length}
              </span>
            </Link>

            {/* 3. Add New Job */}
            <Link
              to="/admin/jobs/new"
              onClick={() => setMobileSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
                isAddJob
                  ? 'bg-[#006398] text-white font-semibold shadow-sm'
                  : 'text-[#afc6ff] hover:bg-[#00163d] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">post_add</span>
              <span>Add New Job</span>
            </Link>

            {/* 4. Edit Jobs */}
            <Link
              to="/admin/jobs"
              onClick={() => {
                setMobileSidebarOpen(false);
                onShowToast('Edit Jobs Mode', 'Select any job below and click Edit to modify circular details.');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition cursor-pointer ${
                isEditJob
                  ? 'bg-[#006398] text-white font-semibold shadow-sm'
                  : 'text-[#afc6ff] hover:bg-[#00163d] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              <span>Edit Jobs</span>
            </Link>

            {/* 5. Categories Section */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#afc6ff]/80 font-bold hover:text-white cursor-pointer"
              >
                <span>Categories</span>
                <span className="material-symbols-outlined text-sm">
                  {categoriesExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {categoriesExpanded && (
                <div className="space-y-0.5 mt-1 pl-1">
                  {categories.map((cat) => {
                    const count = jobs.filter((j) => j.category === cat.name).length;
                    const isSelected = activeCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[#00163d] text-white font-semibold'
                            : 'text-[#afc6ff] hover:bg-[#00163d] hover:text-white'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></span>
                        <span>{cat.name}</span>
                        <span className="ml-auto text-[10px] text-[#afc6ff]/70 font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Settings */}
            <button
              onClick={() => {
                setShowSettingsModal(true);
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#afc6ff] hover:bg-[#00163d] hover:text-white transition cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Officer Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Admin Officer</p>
              <p className="text-[10px] text-[#afc6ff]/70 truncate">
                {adminUser?.email || 'admin@mahanaukri.in'}
              </p>
            </div>
          </div>

          {/* 7. Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 transition cursor-pointer text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}

      {/* MAIN VIEW CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-[#00163d]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#c4c6d0] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#c4c6d0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006398] text-xl">settings</span>
                <h3 className="text-base font-bold text-[#00163d] font-headline">
                  Admin Portal Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#747780] hover:text-[#00163d] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#0b1c30]">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6d0] bg-[#f8f9ff]">
                <div>
                  <p className="font-semibold text-[#00163d]">Auto-Archive Expired Circulars</p>
                  <p className="text-[#44464f] text-[11px]">
                    Move listings to archived state once deadline expires
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoArchive}
                  onChange={(e) => setAutoArchive(e.target.checked)}
                  className="h-4 w-4 text-[#006398] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6d0] bg-[#f8f9ff]">
                <div>
                  <p className="font-semibold text-[#00163d]">Candidate SMS & Alert Gateway</p>
                  <p className="text-[#44464f] text-[11px]">
                    Broadcast alert when Hall Ticket or Result is released
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 text-[#006398] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6d0] bg-[#f8f9ff]">
                <div>
                  <p className="font-semibold text-[#00163d]">Official Watermark Verification</p>
                  <p className="text-[#44464f] text-[11px]">
                    Verify and tag official state gazette .gov.in URLs
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={watermarkPdf}
                  onChange={(e) => setWatermarkPdf(e.target.checked)}
                  className="h-4 w-4 text-[#006398] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#c4c6d0] bg-[#f8f9ff]">
                <div>
                  <p className="font-semibold text-[#00163d]">Daily Recruitment Report Digest</p>
                  <p className="text-[#44464f] text-[11px]">
                    Send summary of active applications to admin email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="h-4 w-4 text-[#006398] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#c4c6d0]">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-[#c4c6d0] text-xs font-semibold rounded-lg hover:bg-[#eff4ff]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  onShowToast('Settings Saved', 'Admin portal preferences have been updated.');
                }}
                className="px-4 py-2 bg-[#006398] text-white text-xs font-semibold rounded-lg hover:bg-[#00476e]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
