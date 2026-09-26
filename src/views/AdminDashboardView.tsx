import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { AdminLayout } from '../components/AdminLayout';

interface AdminDashboardViewProps {
  onShowToast: (title: string, desc: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, deleteJob, toggleJobStatus } = useJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const isAllJobsRoute = location.pathname === '/admin/jobs';

  // Modal confirmation for deleting job
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats calculation matching user specifications:
  // Total Jobs, Active Jobs, Expired Jobs, Police Jobs, Army Jobs, Railway Jobs
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter(
    (j) => j.status === 'published' || j.status === 'active' || j.status === 'hall_ticket_out'
  ).length;
  const expiredJobsCount = jobs.filter(
    (j) => j.status === 'archived' || j.status === 'draft'
  ).length;
  const policeJobsCount = jobs.filter((j) => j.category === 'Police Bharti').length;
  const armyJobsCount = jobs.filter((j) => j.category === 'Army Bharti').length;
  const railwayJobsCount = jobs.filter((j) => j.category === 'Railway').length;

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        job.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Govt' && job.category === 'Maharashtra Govt');

      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const departmentText = (job.department || job.dept || '').toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        departmentText.includes(q) ||
        job.postName.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q)
      );
    });
  }, [jobs, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete.id);
      onShowToast('Job Deleted', `Successfully removed "${jobToDelete.title}" from Firestore database.`);
    } catch {
      onShowToast('Delete Failed', 'Could not delete job document from Firestore.');
    } finally {
      setIsDeleting(false);
      setJobToDelete(null);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const target = jobs.find((j) => j.id === id);
    const willBe = target?.status === 'published' ? 'Unpublished (Draft)' : 'Published (Live)';
    try {
      await toggleJobStatus(id);
      onShowToast('Status Updated', `Job listing is now ${willBe}.`);
    } catch {
      onShowToast('Update Failed', 'Failed to update job status in Firestore.');
    }
  };

  return (
    <AdminLayout
      activeCategory={selectedCategory === 'ALL' ? undefined : selectedCategory}
      onSelectCategory={(cat) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
      }}
      onShowToast={onShowToast}
    >
      <div className="p-4 sm:p-6 md:p-8 max-w-[1240px] w-full mx-auto space-y-6">
        {/* TOP ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c4c6d0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] uppercase tracking-wider text-[#006398] font-bold">
                Government Recruitment Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00163d] mt-1 font-headline">
              {isAllJobsRoute ? 'All Job Postings Management' : 'Admin Dashboard Overview'}
            </h1>
            <p className="text-xs sm:text-sm text-[#44464f]">
              Direct management for Maharashtra government job circulars, official PDFs, and candidate links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/jobs/new"
              className="bg-[#00163d] hover:bg-[#0f2b5c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add New Job</span>
            </Link>
            <button
              onClick={() =>
                onShowToast(
                  'Cache Synchronized',
                  'Portal cache refreshed with latest notification state.'
                )
              }
              title="Refresh Live Cache"
              className="bg-white border border-[#c4c6d0] hover:bg-[#eff4ff] text-[#0b1c30] p-2.5 rounded-xl text-sm shadow-xs transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">sync</span>
            </button>
          </div>
        </div>

        {/* 6 SPECIFIED STATS CARDS:
            1. Total Jobs
            2. Active Jobs
            3. Expired Jobs
            4. Police Jobs
            5. Army Jobs
            6. Railway Jobs
        */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#747780]">
              Recruitment Statistics & Breakdown
            </h2>
            <span className="text-[11px] text-[#006398] font-semibold">Live System Data</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Total Jobs */}
            <div className="bg-white border border-[#c4c6d0] rounded-xl p-4 shadow-xs hover:border-[#006398] transition">
              <div className="flex items-center justify-between text-[#747780]">
                <span className="text-[11px] uppercase font-bold text-[#0b1c30]">Total Jobs</span>
                <span className="material-symbols-outlined text-[#00163d] text-lg">work</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#00163d] font-mono">
                  {totalJobsCount}
                </span>
                <span className="text-[10px] text-[#747780] font-medium">total</span>
              </div>
              <p className="text-[11px] text-[#44464f] mt-1 truncate">All portal entries</p>
            </div>

            {/* 2. Active Jobs */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20 hover:border-emerald-500 transition">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[11px] uppercase font-bold text-emerald-800">Active Jobs</span>
                <span className="material-symbols-outlined text-emerald-600 text-lg">bolt</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  {activeJobsCount}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1 py-0.2 rounded">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 mt-1 truncate">Accepting applications</p>
            </div>

            {/* 3. Expired Jobs */}
            <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20 hover:border-rose-400 transition">
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-[11px] uppercase font-bold text-rose-800">Expired Jobs</span>
                <span className="material-symbols-outlined text-rose-600 text-lg">timer_off</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-rose-700 font-mono">
                  {expiredJobsCount}
                </span>
                <span className="text-[10px] text-rose-600 font-medium">closed/draft</span>
              </div>
              <p className="text-[11px] text-rose-800 mt-1 truncate">Deadline passed</p>
            </div>

            {/* 4. Police Jobs */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs hover:border-blue-400 transition">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-[11px] uppercase font-bold text-blue-800">Police Jobs</span>
                <span className="material-symbols-outlined text-blue-600 text-lg">local_police</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-900 font-mono">
                  {policeJobsCount}
                </span>
                <span className="text-[10px] text-blue-700 font-medium">bharti</span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1 truncate">Constable / SRPF</p>
            </div>

            {/* 5. Army Jobs */}
            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs hover:border-amber-400 transition">
              <div className="flex items-center justify-between text-amber-900">
                <span className="text-[11px] uppercase font-bold text-amber-900">Army Jobs</span>
                <span className="material-symbols-outlined text-amber-700 text-lg">military_tech</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-900 font-mono">
                  {armyJobsCount}
                </span>
                <span className="text-[10px] text-amber-800 font-medium">rally</span>
              </div>
              <p className="text-[11px] text-amber-900 mt-1 truncate">Agniveer & GD</p>
            </div>

            {/* 6. Railway Jobs */}
            <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-xs hover:border-indigo-400 transition">
              <div className="flex items-center justify-between text-indigo-900">
                <span className="text-[11px] uppercase font-bold text-indigo-900">Railway Jobs</span>
                <span className="material-symbols-outlined text-indigo-700 text-lg">train</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-900 font-mono">
                  {railwayJobsCount}
                </span>
                <span className="text-[10px] text-indigo-700 font-medium">RRB/RRC</span>
              </div>
              <p className="text-[11px] text-indigo-900 mt-1 truncate">Central & Western</p>
            </div>
          </div>
        </section>

        {/* RECRUITMENT MANAGEMENT SECTION */}
        <section className="bg-white border border-[#c4c6d0] rounded-xl shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-[#c4c6d0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#f8f9ff]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <h2 className="text-sm font-bold text-[#00163d] font-headline whitespace-nowrap">
                Job Postings Registry
              </h2>
              <span className="bg-[#00163d] text-white text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold">
                {filteredJobs.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {['ALL', 'Police Bharti', 'Army Bharti', 'Railway', 'SSC', 'Banking'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#006398] text-white shadow-xs'
                        : 'bg-white border border-[#c4c6d0] text-[#44464f] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#747780] text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by title, dept..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] placeholder-[#747780] focus:border-[#006398] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#eff4ff] text-[#44464f] uppercase tracking-wider text-[11px] font-bold border-b border-[#c4c6d0]">
                  <th className="py-3 px-4">Recruitment Post Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Vacancies</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Official Links</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6d0]/60">
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#747780]">
                      <span className="material-symbols-outlined text-3xl mb-1 text-[#747780]">
                        search_off
                      </span>
                      <p className="font-semibold text-xs">No job postings found</p>
                      <p className="text-[11px] text-[#44464f] mt-0.5">
                        Try changing the search keyword or category filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => {
                    const isDraft = job.status === 'draft';
                    return (
                      <tr key={job.id} className="hover:bg-[#f8f9ff] transition">
                        {/* Title & Dept */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-bold text-[#00163d] leading-snug line-clamp-1">
                            {job.title}
                          </p>
                          <p className="text-[11px] text-[#44464f] truncate mt-0.5">
                            {job.dept} • {job.postName}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff4ff] text-[#006398] border border-[#afc6ff]/40">
                            {job.category}
                          </span>
                        </td>

                        {/* Vacancies */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-[#0b1c30]">
                          {job.vacancies.toLocaleString()}
                        </td>

                        {/* Deadline */}
                        <td className="py-3 px-3 whitespace-nowrap text-[#44464f]">
                          {job.lastDate}
                        </td>

                        {/* Status & Publish Toggle */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(job.id)}
                            title={isDraft ? 'Click to Publish live' : 'Click to Unpublish (set Draft)'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                              isDraft
                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isDraft ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></span>
                            <span>{isDraft ? 'Draft (Hidden)' : 'Published'}</span>
                          </button>
                        </td>

                        {/* Official Links Quick Preview */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {job.applyUrl && (
                              <a
                                href={job.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Apply Online URL"
                                className="p-1 rounded bg-[#eff4ff] text-[#006398] hover:bg-[#006398] hover:text-white transition"
                              >
                                <span className="material-symbols-outlined text-[15px]">open_in_browser</span>
                              </a>
                            )}
                            {(job.notificationPdf || job.pdfUrl || job.notificationLink) && (
                              <a
                                href={job.notificationPdf || job.pdfUrl || job.notificationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Official Notification PDF"
                                className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white transition"
                              >
                                <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                              </a>
                            )}
                            {job.hallTicketUrl && (
                              <a
                                href={job.hallTicketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Hall Ticket URL"
                                className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition"
                              >
                                <span className="material-symbols-outlined text-[15px]">badge</span>
                              </a>
                            )}
                            {job.resultUrl && (
                              <a
                                href={job.resultUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open Result URL"
                                className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white transition"
                              >
                                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/admin/jobs/edit/${job.id}`)}
                              title="Edit Circular Details"
                              className="px-2.5 py-1 rounded-lg bg-white border border-[#c4c6d0] hover:bg-[#eff4ff] text-[#006398] font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setJobToDelete({ id: job.id, title: job.title })}
                              title="Delete Circular"
                              className="p-1.5 rounded-lg border border-[#c4c6d0] text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-[#c4c6d0] flex items-center justify-between text-xs bg-[#f8f9ff]">
              <span className="text-[#44464f]">
                Showing Page <span className="font-bold text-[#0b1c30]">{currentPage}</span> of{' '}
                <span className="font-bold text-[#0b1c30]">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#c4c6d0] bg-white text-[#0b1c30] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#c4c6d0] bg-white text-[#0b1c30] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eff4ff] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* DELETE CONFIRMATION MODAL */}
        {jobToDelete && (
          <div className="fixed inset-0 z-50 bg-[#00163d]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#c4c6d0] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#00163d] font-headline">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-[#747780]">Firestore Database Action</p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/80 text-xs text-[#0b1c30] space-y-1">
                <p className="font-semibold text-rose-950">
                  Are you sure you want to delete this recruitment posting?
                </p>
                <p className="text-[#44464f] font-medium line-clamp-2">
                  &ldquo;{jobToDelete.title}&rdquo;
                </p>
                <p className="text-[11px] text-rose-800 pt-1">
                  This action is permanent and will remove the job document from Firestore and the public website immediately.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#c4c6d0]/60">
                <button
                  disabled={isDeleting}
                  onClick={() => setJobToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#44464f] hover:bg-[#eff4ff] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>Delete Job</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
