import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  isDark?: boolean;
}

export const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1V_s-8rPR2e5HFVKSWkj9YLQljx6gYNCmZzuam9iEFibI4BxyBmgB0lBDtKMDeQiO_YOlhaX76ddtvGomMTaZIh6AWQfUUp7v_z19GAFI0YMv5lw4Jm0qSoNNvnDFK9dvWwEDI7j9bNTb3P0hjZYHZ50s9t_ltHuXeiHw09q1IiJqCGv0SPpNcxzCZJ4BA-u027ZI3s1Rkp8RFAyo9JXDniGpXLvsFVSu0Wnyls8GCmGP64O7fzcTvKd4o";

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "h-10", showText = false, isDark = false }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!imgError ? (
        <img
          src={LOGO_URL}
          alt="MahaNaukri Update Emblem"
          className="h-full w-auto object-contain rounded-md select-none"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Precise SVG recreation of Image 1 / Image 2 logo */
        <div className="flex items-center gap-2.5">
          <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#173679" />
            <polygon points="50,15 62,38 86,42 68,59 73,83 50,71 27,83 32,59 14,42 38,38" fill="#FFFFFF" />
            <circle cx="50" cy="52" r="14" fill="#F06016" />
            <path d="M50 44V60M42 52H58" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0f2b5c]'}`}>
                MahaNaukri
              </span>
              <span className="bg-[#f06016] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                UPDATE
              </span>
            </div>
            <span className={`text-[10px] ${isDark ? 'text-blue-200' : 'text-slate-500'} font-medium`}>
              Govt Jobs & Bharti Recruitment Portal
            </span>
          </div>
        </div>
      )}

      {showText && !imgError && (
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#00163d]'}`}>
              MahaNaukri
            </span>
            <span className="bg-[#fb641c] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
              UPDATE
            </span>
          </div>
          <span className={`text-[11px] ${isDark ? 'text-blue-200' : 'text-slate-500'} font-medium`}>
            Govt Jobs & Bharti Recruitment Portal
          </span>
        </div>
      )}
    </div>
  );
};
