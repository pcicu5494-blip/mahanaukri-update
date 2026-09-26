import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { BrandLogo } from '../components/BrandLogo';

interface AdminLoginViewProps {
  onShowToast: (title: string, desc: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const { loginAdmin } = useJobs();

  // No hard-coded credentials: user enters their administrator email or username and password
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authenticate against Firebase Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrUsername.trim() || !password.trim()) {
      setError('Please enter both Email / Username and Password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin(emailOrUsername.trim(), password);
      if (result.success) {
        onShowToast('Authenticated', 'Welcome back, Admin Officer. Firebase session active.');
        // Redirect to /admin/dashboard after successful login
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('Unable to reach Firebase authentication service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f9] px-4 py-8">
      <div className="w-full max-w-md bg-white border border-[#c4c6d0] rounded-2xl shadow-xl p-8 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-200">
        {/* Header / Brand matching exact specs:
            MAHANUKRI UPDATE
            ADMIN LOGIN
        */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-[#eff4ff] rounded-2xl border border-[#afc6ff]/40 shadow-xs">
            <BrandLogo className="h-12 w-auto" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#00163d] tracking-wider uppercase font-headline">
              MAHANUKRI UPDATE
            </h1>
            <h2 className="text-base font-extrabold text-[#006398] tracking-widest uppercase mt-1">
              ADMIN LOGIN
            </h2>
          </div>
        </div>

        {/* Error notification if credentials fail */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-rose-600">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form:
            Email / Username
            Password
            [ Login ]
        */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="emailOrUsername"
              className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-2"
            >
              Email / Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#747780] text-lg">
                person
              </span>
              <input
                id="emailOrUsername"
                type="text"
                autoComplete="username email"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Email or Username"
                className="w-full pl-10 pr-3.5 py-3 bg-[#f8f9ff] border border-[#c4c6d0] rounded-xl text-sm text-[#0b1c30] placeholder-[#747780] focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#747780] text-lg">
                lock
              </span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-10 pr-3.5 py-3 bg-[#f8f9ff] border border-[#c4c6d0] rounded-xl text-sm text-[#0b1c30] placeholder-[#747780] focus:bg-white focus:border-[#006398] focus:ring-2 focus:ring-[#006398]/20 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#00163d] hover:bg-[#0f2b5c] text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>[ Login ]</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#c4c6d0]/60">
          <p className="text-[11px] text-[#747780]">
            Authorized administrative officers only.
          </p>
        </div>
      </div>
    </div>
  );
};
