/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Job } from './types';
import { JobProvider, useJobs } from './context/JobContext';
import { PortalView } from './views/PortalView';
import { JobDetailView } from './views/JobDetailView';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminAddJobView } from './views/AdminAddJobView';
import { Modals } from './components/Modals';

/**
 * Route protection wrapper:
 * If user is not authenticated, immediately redirects to /admin/login.
 * Does not render admin components or controls for unauthenticated users.
 */
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, authLoading } = useJobs();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#006398] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#747780] font-medium">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state for candidate interactions (Apply, Hall Ticket, PDF syllabus, Results)
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalJob, setModalJob] = useState<Job | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; title: string; desc: string }>({
    show: false,
    title: '',
    desc: '',
  });

  const showToast = (title: string, desc: string) => {
    setToast({ show: true, title, desc });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Support direct URL access via hash or query param (e.g. #/admin/login or ?url=/admin/login)
  useEffect(() => {
    if (window.location.hash) {
      const hashPath = window.location.hash.replace(/^#\/?/, '/');
      if (hashPath.startsWith('/admin')) {
        navigate(hashPath, { replace: true });
        return;
      }
    }
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url') || params.get('path') || params.get('route');
    if (targetUrl && targetUrl.startsWith('/admin')) {
      navigate(targetUrl, { replace: true });
      return;
    }
  }, [navigate]);

  // Keyboard shortcut: Alt + A or Alt + L to quickly open /admin/login directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'l' || e.key === 'L')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'l' || e.key === 'L'))) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleOpenModal = (modalType: string, job?: Job) => {
    setModalJob(job || jobs[0]);
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      {/* TOAST NOTIFICATION CONTAINER */}
      <div
        className={`fixed top-4 right-4 sm:right-6 z-50 transform transition-all duration-300 pointer-events-none ${
          toast.show ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="bg-white border-l-4 border-emerald-600 rounded-xl shadow-xl p-4 flex items-start gap-3 max-w-md border border-[#c4c6d0]">
          <span className="material-symbols-outlined text-emerald-600 text-xl mt-0.5 fill-icon">
            check_circle
          </span>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">{toast.title}</p>
            <p className="text-xs text-[#44464f] mt-0.5">{toast.desc}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-[#747780] hover:text-[#0b1c30] ml-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* ROUTES CONFIGURATION */}
      <Routes>
        {/* PUBLIC WEBSITE ROUTES (Normal visitors only see public content) */}
        <Route
          path="/"
          element={
            <PortalView
              onOpenModal={handleOpenModal}
              onShowToast={showToast}
            />
          }
        />
        <Route
          path="/category/:category"
          element={
            <PortalView
              onOpenModal={handleOpenModal}
              onShowToast={showToast}
            />
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <JobDetailView
              onOpenModal={handleOpenModal}
              onShowToast={showToast}
            />
          }
        />

        {/* ADMIN AUTHENTICATION (Clean standalone page) */}
        <Route
          path="/admin/login"
          element={<AdminLoginView onShowToast={showToast} />}
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* PROTECTED ADMIN ROUTES (Require verified admin authentication)
            - If unauthenticated, immediately redirects to /admin/login
        */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardView onShowToast={showToast} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardView onShowToast={showToast} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/jobs/new"
          element={
            <ProtectedAdminRoute>
              <AdminAddJobView onShowToast={showToast} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/jobs/edit/:id"
          element={
            <ProtectedAdminRoute>
              <AdminAddJobView onShowToast={showToast} />
            </ProtectedAdminRoute>
          }
        />

        {/* Catch-all redirect to public home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PUBLIC CANDIDATE MODALS */}
      <Modals
        activeModal={activeModal}
        selectedJob={modalJob}
        onClose={handleCloseModal}
        onShowToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </BrowserRouter>
  );
}
