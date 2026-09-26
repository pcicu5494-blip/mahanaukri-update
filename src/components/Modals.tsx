import React, { useState } from 'react';
import { Job } from '../types';

interface ModalsProps {
  activeModal: string | null;
  selectedJob: Job | null;
  onClose: () => void;
  onOpenJobDetailScreen?: (jobId: string) => void;
  onShowToast: (title: string, desc: string) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  activeModal,
  selectedJob,
  onClose,
  onOpenJobDetailScreen,
  onShowToast,
}) => {
  // Hall ticket search form state
  const [htExam, setHtExam] = useState('Maharashtra Police Constable Exam 2026');
  const [htAppNo, setHtAppNo] = useState('MH202699824');
  const [htDob, setHtDob] = useState('15/08/1999');
  const [htSearching, setHtSearching] = useState(false);

  // Apply dialog state
  const [applyDistrict, setApplyDistrict] = useState('Mumbai City (Commissioner of Police)');
  const [applyMobile, setApplyMobile] = useState('');

  if (!activeModal) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#00163d]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 1. JOB QUICK DETAILS PREVIEW MODAL */}
      {activeModal === 'job-quick-details' && selectedJob && (
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#c4c6d0] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="sticky top-0 bg-white border-b border-[#c4c6d0] px-6 py-4 flex items-center justify-between z-10">
            <div>
              <span className="text-xs font-semibold text-[#006398] uppercase tracking-wider block">
                {selectedJob.dept}
              </span>
              <h3 className="text-lg font-bold text-[#00163d]">
                {selectedJob.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#747780] hover:text-[#00163d] p-1.5 rounded-lg hover:bg-[#eff4ff] transition"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Live Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#eff4ff] rounded-lg border border-[#c4c6d0]/60">
              <div>
                <span className="text-xs text-[#747780] block">Application Mode:</span>
                <span className="font-semibold text-[#00163d] text-sm">Online (Official Portal)</span>
              </div>
              <div>
                <span className="text-xs text-[#747780] block">Job Location:</span>
                <span className="font-semibold text-[#00163d] text-sm">Maharashtra State</span>
              </div>
              <div>
                <span className="text-xs text-[#747780] block">Selection Process:</span>
                <span className="font-semibold text-[#00163d] text-sm">Physical & Written Test</span>
              </div>
            </div>

            {/* Overview Table */}
            <div>
              <h4 className="text-base font-bold text-[#00163d] mb-2">Recruitment Overview</h4>
              <table className="w-full text-xs text-left border border-[#c4c6d0] rounded-lg overflow-hidden">
                <tbody className="divide-y divide-[#c4c6d0]">
                  <tr className="bg-[#eff4ff]">
                    <td className="px-4 py-2.5 font-semibold text-[#44464f] w-1/3">Post Designation</td>
                    <td className="px-4 py-2.5 text-[#00163d] font-medium">{selectedJob.postName}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-[#44464f]">Total Openings</td>
                    <td className="px-4 py-2.5 text-[#00163d] font-bold font-mono">{selectedJob.vacancies.toLocaleString()} Vacancies</td>
                  </tr>
                  <tr className="bg-[#eff4ff]">
                    <td className="px-4 py-2.5 font-semibold text-[#44464f]">Educational Eligibility</td>
                    <td className="px-4 py-2.5 text-[#00163d]">{selectedJob.qualification}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-[#44464f]">Age Eligibility</td>
                    <td className="px-4 py-2.5 text-[#00163d]">{selectedJob.ageLimit}</td>
                  </tr>
                  <tr className="bg-[#eff4ff]">
                    <td className="px-4 py-2.5 font-semibold text-[#44464f]">Application Fee</td>
                    <td className="px-4 py-2.5 text-[#00163d]">{selectedJob.fee || 'Check official gazette notification'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-[#44464f]">Registration Deadline</td>
                    <td className="px-4 py-2.5 text-[#ba1a1a] font-bold">{selectedJob.lastDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Source Link Box */}
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <span className="material-symbols-outlined text-sm">verified</span>
                Official Notification & Registration Source
              </div>
              <p className="text-xs text-emerald-800">
                Always review the official government gazette PDF before filling in application forms.
              </p>
            </div>
          </div>

          <div className="bg-[#eff4ff] border-t border-[#c4c6d0] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                if (onOpenJobDetailScreen) {
                  onClose();
                  onOpenJobDetailScreen(selectedJob.id);
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#747780] text-[#00163d] hover:bg-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span className="material-symbols-outlined text-base">pageview</span>
              <span>Open Full Detail Page</span>
            </button>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-[#747780] hover:text-[#00163d] text-xs font-medium"
              >
                Close
              </button>
              <a
                href={selectedJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  onShowToast('Redirecting to Portal', `Opening official application portal: ${selectedJob.dept}`);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg bg-[#0f2b5c] text-white hover:bg-[#00163d] text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
              >
                <span>Apply Online Now</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. HALL TICKET DOWNLOAD MODAL */}
      {activeModal === 'hall-ticket' && (
        <div className="bg-white rounded-xl max-w-lg w-full border border-[#c4c6d0] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006398] text-2xl">badge</span>
              <h3 className="text-lg font-bold text-[#00163d]">Hall Ticket Search Portal</h3>
            </div>
            <button onClick={onClose} className="text-[#747780] hover:text-[#00163d]">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">Select Examination</label>
              <select 
                value={htExam}
                onChange={(e) => setHtExam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] bg-white text-[#0b1c30] outline-none focus:border-[#006398]"
              >
                <option>Maharashtra Police Constable Exam 2026</option>
                <option>MPSC State Services Preliminary Exam 2026</option>
                <option>Railway RRB NTPC Stage 1 CBT</option>
                <option>SSC GD Constable Admit Card 2026</option>
                <option>State Bank of India (SBI PO) Prelims</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">Registration / Application Number</label>
              <input
                type="text"
                value={htAppNo}
                onChange={(e) => setHtAppNo(e.target.value)}
                placeholder="e.g. MH202699824"
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] outline-none focus:border-[#006398]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#0b1c30] mb-1">Date of Birth (DD/MM/YYYY)</label>
              <input
                type="text"
                value={htDob}
                onChange={(e) => setHtDob(e.target.value)}
                placeholder="15/08/1999"
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] outline-none focus:border-[#006398]"
              />
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-lg border border-[#c4c6d0]/60 text-[11px] text-[#44464f] flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-[#006398] mt-0.5">verified_user</span>
              <span>All admit cards are fetched directly via certified state server nodes with live digital signature.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[#747780] hover:text-[#00163d] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={htSearching}
              onClick={() => {
                setHtSearching(true);
                setTimeout(() => {
                  setHtSearching(false);
                  onShowToast(
                    'Admit Card Found!',
                    `Hall Ticket for ${htAppNo} (${htExam}) generated. Examination Center: Mumbai Suburban Ground.`
                  );
                  onClose();
                }, 800);
              }}
              className="px-5 py-2.5 rounded-lg bg-[#0f2b5c] text-white hover:bg-[#00163d] text-xs font-bold flex items-center gap-1.5 transition shadow"
            >
              {htSearching ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Record...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Fetch Admit Card</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. OFFICIAL NOTIFICATION PDF MODAL */}
      {activeModal === 'pdf-modal' && (
        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-[#c4c6d0] relative animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-2xl">picture_as_pdf</span>
              <div>
                <h3 className="text-base font-bold text-[#00163d]">
                  {selectedJob?.title || 'mahapolice_advt_2026.pdf'}
                </h3>
                <span className="text-[11px] text-[#747780]">Official Gazette Notification Document Preview</span>
              </div>
            </div>
            <button onClick={onClose} className="text-[#747780] hover:text-[#00163d]">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="bg-[#eff4ff] border border-[#c4c6d0] rounded-lg p-5 space-y-3 text-xs text-[#44464f]">
            <div className="text-center border-b border-[#c4c6d0] pb-3">
              <p className="font-bold text-[#00163d] text-sm">
                महाराष्ट्र शासन पोलीस महासंचालक कार्यालय, महाराष्ट्र राज्य, मुंबई
              </p>
              <p className="text-[11px] text-[#006398] font-medium mt-0.5">
                पोलीस शिपाई / पोलीस चालक भरती २०२६ - अधिकृत जाहिरात क्र. {selectedJob?.advtNo || 'MP-CONST-2026/01'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong>एकूण पदे (Total Vacancies):</strong> {selectedJob?.vacancies.toLocaleString()} पदे</div>
              <div><strong>अर्ज सुरू दिनांक:</strong> {selectedJob?.startDate || '०५ ऑक्टोबर २०२६'}</div>
              <div><strong>अंतिम मुदत:</strong> {selectedJob?.lastDate || '२० ऑक्टोबर २०२६'}</div>
              <div><strong>वेतनश्रेणी:</strong> {selectedJob?.salary || 'रु. २१,७०० - रु. ६९,१००'}</div>
            </div>
            <div className="p-3 bg-white rounded border border-[#c4c6d0] text-[11px] space-y-1">
              <p className="font-semibold text-[#00163d]">शारीरिक पात्रता निकष (Physical Standards & Norms):</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[#44464f]">
                <li>पुरुष उमेदवार: किमान उंची १६५ सें.मी., छाती न फुगवता ७९ सें.मी. (किमान ५ सें.मी. फुगवणे आवश्यक)</li>
                <li>महिला उमेदवार: किमान उंची १५८ सें.मी.</li>
                <li>१६०० मीटर धावणे: पुरुष ५० गुण | ८०० मीटर धावणे: महिला ५० गुण</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-[#747780]">File Size: 4.8 MB | Language: Marathi / English Gazette</span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#c4c6d0] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  onShowToast('PDF Download Started', 'mahapolice_advt_2026.pdf (Official Marathi Gazetted Copy)');
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-[#0f2b5c] text-white hover:bg-[#00163d] text-xs font-bold inline-flex items-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Full PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. APPLY ONLINE MODAL */}
      {activeModal === 'apply-modal' && (
        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#c4c6d0] relative animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006398]">how_to_reg</span>
              <h3 className="text-base font-bold text-[#00163d]">Apply Online - Official Gateway</h3>
            </div>
            <button onClick={onClose} className="text-[#747780] hover:text-[#00163d]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-4 text-xs text-[#44464f]">
            <div className="p-3 bg-[#eff4ff] rounded border border-[#c4c6d0] text-xs">
              <strong className="text-[#00163d]">Target Recruitment:</strong> {selectedJob?.title || 'Maharashtra Police Constable 2026'} ({selectedJob?.advtNo || 'MP-CONST-2026/01'})
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Aadhaar / Mobile Number for OTP Verification</label>
                <input
                  type="text"
                  value={applyMobile}
                  onChange={(e) => setApplyMobile(e.target.value)}
                  placeholder="e.g. 9820012345"
                  className="w-full px-3 py-2 rounded border border-[#c4c6d0] text-xs outline-none focus:border-[#006398]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Select Applied District / Unit Cadre</label>
                <select
                  value={applyDistrict}
                  onChange={(e) => setApplyDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#c4c6d0] text-xs outline-none focus:border-[#006398] bg-white"
                >
                  <option>Mumbai City (Commissioner of Police)</option>
                  <option>Pune City Police Headquarters</option>
                  <option>Nagpur City Police Unit</option>
                  <option>Nashik Rural Police</option>
                  <option>Thane City Police Commissionerate</option>
                  <option>SRPF Group 1 / Pune</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-[#747780]">
              You will be redirected to the secure official Maharashtra State Police recruitment gateway (<strong>mahapolice.gov.in</strong>).
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#c4c6d0] text-[#0b1c30] text-xs font-semibold hover:bg-[#eff4ff]"
            >
              Cancel
            </button>
            <a
              href={selectedJob?.applyLink || selectedJob?.applyUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onShowToast('Transferring to Official Portal', `Transferring to official portal for ${selectedJob?.department || selectedJob?.dept || 'application'}`);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#0f2b5c] text-white font-bold text-xs hover:bg-[#00163d] inline-flex items-center gap-1.5 shadow"
            >
              <span>Proceed to Official Portal</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      )}

      {/* 5. RESULT TRACKER MODAL */}
      {activeModal === 'result-modal' && (
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c4c6d0] relative animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#c4c6d0] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006398]">assignment_turned_in</span>
              <h3 className="text-base font-bold text-[#00163d]">Result & Merit List Tracker</h3>
            </div>
            <button onClick={onClose} className="text-[#747780] hover:text-[#00163d]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-[#44464f]">
            <p>The recruitment process for 2026 is currently in the <strong className="text-[#00163d]">Application Stage</strong>.</p>
            <div className="p-3 bg-[#eff4ff] rounded border border-[#c4c6d0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Physical Test (PET) Marks:</span>
                <strong className="text-[#00163d]">Expected Dec 2026</strong>
              </div>
              <div className="flex justify-between">
                <span>Written Exam Result & Answer Key:</span>
                <strong className="text-[#00163d]">Expected Jan 2027</strong>
              </div>
              <div className="flex justify-between">
                <span>Final District Merit List & Cutoffs:</span>
                <strong className="text-[#00163d]">Expected Feb 2027</strong>
              </div>
            </div>
            <p className="text-[11px] text-[#747780]">
              All individual scorecards and category-wise cut-offs will be announced with SMS push notifications to enrolled candidates.
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0f2b5c] text-white text-xs font-bold hover:bg-[#00163d]"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* 6. EXTERNAL OFFICIAL PORTAL CONFIRMATION MODAL */}
      {activeModal === 'portal-modal' && (
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c4c6d0] relative text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-full bg-[#dce9ff] text-[#006398] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">open_in_new</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#00163d]">External Government Portal</h3>
            <p className="text-xs text-[#44464f] mt-1">
              You are navigating to Maharashtra Police Department&apos;s official domain:
              <br /><strong className="text-[#006398]">https://mahapolice.gov.in</strong>
            </p>
          </div>
          <p className="text-[11px] text-[#747780] bg-[#eff4ff] p-2.5 rounded border border-[#c4c6d0]">
            Ensure you verify the SSL padlock and legitimate <strong>.gov.in</strong> domain before providing sensitive personal identity or bank details.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#c4c6d0] text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              Stay on MahaNaukri
            </button>
            <a
              href="https://mahapolice.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0f2b5c] text-white text-xs font-bold hover:bg-[#00163d]"
            >
              Continue to mahapolice.gov.in
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
