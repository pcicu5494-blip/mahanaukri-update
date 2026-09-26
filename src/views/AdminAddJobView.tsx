import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Job, JobCategory } from '../types';
import { useJobs } from '../context/JobContext';
import { AdminLayout } from '../components/AdminLayout';
import { storage } from '../firebase';

interface AdminAddJobViewProps {
  onShowToast: (title: string, desc: string) => void;
}

export const AdminAddJobView: React.FC<AdminAddJobViewProps> = ({ onShowToast }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { getJobById, fetchJobById, addJob, updateJob } = useJobs();

  const isEditMode = Boolean(id);
  const [existingJob, setExistingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Primary job details
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('');
  const [category, setCategory] = useState<JobCategory>('Police Bharti');
  const [postName, setPostName] = useState('');
  const [vacancies, setVacancies] = useState<number>(100);

  // Eligibility & specifics
  const [qualification, setQualification] = useState('');
  const [ageLimit, setAgeLimit] = useState('');
  const [ageRelaxation, setAgeRelaxation] = useState('');
  const [location, setLocation] = useState('All Maharashtra');
  const [salary, setSalary] = useState('');
  const [fee, setFee] = useState('');
  const [physicalRequirements, setPhysicalRequirements] = useState('');

  // Dates
  const [startDate, setStartDate] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [examDate, setExamDate] = useState('');

  // Stages & Docs
  const [stages, setStages] = useState<string[]>([
    'Physical Efficiency Test (PET/PST)',
    'Written Examination (OMR/CBT)',
    'Document Verification',
  ]);

  const [docs, setDocs] = useState<string[]>([
    '10th (SSC) Marksheet & Certificate',
    '12th (HSC) Marksheet & Certificate',
    'Maharashtra Domicile Certificate',
  ]);
  const [newDocInput, setNewDocInput] = useState('');

  const [howToApply, setHowToApply] = useState(
    `1. Read the official PDF notification carefully before registering.
2. Complete online registration on official portal.
3. Upload required documents and pay exam fee online.`
  );

  // Stable job ID for Firebase Storage structured path (for both new jobs and edits)
  const tempJobIdRef = useRef<string>(
    'job-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 6)
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Official Links & Release Flags
  const [applyUrl, setApplyUrl] = useState('');
  const [hallTicketUrl, setHallTicketUrl] = useState('');
  const [hallTicketReleased, setHallTicketReleased] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultReleased, setResultReleased] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Firebase Storage PDF Upload State
  const [notificationPdfUrl, setNotificationPdfUrl] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Load existing job if in edit mode
  useEffect(() => {
    if (id) {
      const cached = getJobById(id);
      if (cached) {
        setExistingJob(cached);
      } else {
        fetchJobById(id).then((fetched) => {
          if (fetched) setExistingJob(fetched);
        });
      }
    }
  }, [id, getJobById, fetchJobById]);

  // Pre-populate data if editing
  useEffect(() => {
    if (existingJob) {
      setTitle(existingJob.title || '');
      setDept(existingJob.department || existingJob.dept || '');
      setCategory((existingJob.category as JobCategory) || 'Police Bharti');
      setPostName(existingJob.postName || '');
      setVacancies(existingJob.vacancies || 0);
      setQualification(existingJob.qualification || '');
      setAgeLimit(existingJob.ageLimit || '');
      setAgeRelaxation(existingJob.ageRelaxation || '');
      setLocation(existingJob.location || 'All Maharashtra');
      setSalary(existingJob.salary || '');
      setFee(existingJob.applicationFee || existingJob.fee || '');
      setPhysicalRequirements(existingJob.physicalRequirements || '');
      setStartDate(existingJob.startDate || '');
      setLastDate(existingJob.lastDate || '');
      setExamDate(existingJob.examDate || '');

      if (existingJob.selectionStages && existingJob.selectionStages.length > 0) {
        setStages(existingJob.selectionStages);
      } else if (typeof existingJob.selectionProcess === 'string' && existingJob.selectionProcess) {
        setStages(existingJob.selectionProcess.split('\n').filter(Boolean));
      }

      if (existingJob.requiredDocs && existingJob.requiredDocs.length > 0) {
        setDocs(existingJob.requiredDocs);
      } else if (typeof existingJob.documentsRequired === 'string' && existingJob.documentsRequired) {
        setDocs(existingJob.documentsRequired.split('\n').filter(Boolean));
      }

      if (existingJob.howToApply) {
        setHowToApply(Array.isArray(existingJob.howToApply) ? existingJob.howToApply.join('\n') : String(existingJob.howToApply));
      }

      setApplyUrl(existingJob.applyLink || existingJob.applyUrl || '');
      setHallTicketUrl(existingJob.hallTicketLink || existingJob.hallTicketUrl || '');
      setHallTicketReleased(Boolean(existingJob.hallTicketReleased));
      setPdfUrl(existingJob.notificationLink || existingJob.pdfUrl || existingJob.notificationPdf || '');
      setNotificationPdfUrl(existingJob.notificationPdf || existingJob.notificationLink || existingJob.pdfUrl || '');
      setWebsiteUrl(existingJob.officialWebsite || existingJob.websiteUrl || '');
      setResultUrl(existingJob.resultLink || existingJob.resultUrl || '');
      setResultReleased(Boolean(existingJob.resultReleased));
      setFeatured(Boolean(existingJob.featured));
    }
  }, [existingJob]);

  const handleStageToggle = (stageName: string) => {
    if (stages.includes(stageName)) {
      setStages(stages.filter((s) => s !== stageName));
    } else {
      setStages([...stages, stageName]);
    }
  };

  const handleRemoveDoc = (docName: string) => {
    setDocs(docs.filter((d) => d !== docName));
  };

  const handleAddDoc = () => {
    if (newDocInput.trim() && !docs.includes(newDocInput.trim())) {
      setDocs([...docs, newDocInput.trim()]);
      setNewDocInput('');
    }
  };

  // Upload file to Firebase Storage
  const uploadPdfFile = (file: File) => {
    const targetJobId = id || tempJobIdRef.current;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `job-notifications/${targetJobId}/${Date.now()}_${sanitizedName}`;
    const storageRef = ref(storage, storagePath);

    setIsUploadingPdf(true);
    setUploadProgress(0);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        setIsUploadingPdf(false);
        setUploadErrorMessage(
          `Upload failed: ${error.message || 'Please check your connection and try again.'}`
        );
        onShowToast('Upload Error', 'Failed to upload PDF to Firebase Storage.');
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setNotificationPdfUrl(downloadUrl);
          setPdfUrl(downloadUrl);
          setIsUploadingPdf(false);
          setUploadProgress(100);
          setUploadSuccessMessage(
            `"${file.name}" uploaded successfully! Download URL linked.`
          );
          onShowToast('PDF Uploaded', `Official notification PDF saved to Firebase Storage.`);
        } catch (err: unknown) {
          console.error('Error fetching download URL:', err);
          setIsUploadingPdf(false);
          setUploadErrorMessage('Could not retrieve PDF download URL.');
          onShowToast('Error', 'Failed to retrieve uploaded PDF URL.');
        }
      }
    );
  };

  // Handle PDF file selection and validation
  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict PDF MIME & extension validation
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      setUploadErrorMessage('Invalid file format. Only PDF files (application/pdf) are allowed.');
      onShowToast('Invalid File Type', 'Please choose a valid .pdf file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. File size validation (Max 25 MB)
    const MAX_SIZE_BYTES = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadErrorMessage(
        `File is too large (${fileSizeMB} MB). The maximum allowed PDF size is 25 MB.`
      );
      onShowToast('File Too Large', `PDF size (${fileSizeMB} MB) exceeds 25 MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedPdfFile(file);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    // Upload directly to Firebase Storage
    uploadPdfFile(file);
  };

  // Submit Handler for Add / Edit Job
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (isUploadingPdf) {
      onShowToast('Please Wait', 'Notification PDF is currently uploading to Firebase Storage.');
      return;
    }

    // 1. Validate required fields
    if (!title.trim()) {
      onShowToast('Validation Error', 'Notification Title is required.');
      return;
    }
    if (!dept.trim()) {
      onShowToast('Validation Error', 'Department name is required.');
      return;
    }
    if (!postName.trim()) {
      onShowToast('Validation Error', 'Designation / Post Name is required.');
      return;
    }
    if (!lastDate.trim()) {
      onShowToast('Validation Error', 'Last Date to Apply is required.');
      return;
    }
    if (!applyUrl.trim()) {
      onShowToast('Validation Error', 'Apply Online link is required.');
      return;
    }

    setIsSubmitting(true);

    const activeJobId = isEditMode && id ? id : tempJobIdRef.current;
    const finalNotificationPdf = notificationPdfUrl.trim() || pdfUrl.trim();

    const jobData: Partial<Job> = {
      id: activeJobId,
      title: title.trim(),
      department: dept.trim(),
      dept: dept.trim(),
      category,
      postName: postName.trim(),
      vacancies: Number(vacancies) || 0,
      qualification: qualification.trim() || 'As per notification',
      ageLimit: ageLimit.trim() || '18 - 38 Years',
      ageRelaxation: ageRelaxation.trim(),
      location: location.trim() || 'All Maharashtra',
      salary: salary.trim(),
      applicationFee: fee.trim(),
      fee: fee.trim(),
      startDate: startDate.trim(),
      lastDate: lastDate.trim(),
      examDate: examDate.trim(),
      selectionProcess: stages.join('\n'),
      physicalRequirements: physicalRequirements.trim(),
      documentsRequired: docs.join('\n'),
      howToApply: howToApply.trim(),
      applyLink: applyUrl.trim(),
      applyUrl: applyUrl.trim(),
      hallTicketLink: hallTicketUrl.trim(),
      hallTicketUrl: hallTicketUrl.trim(),
      hallTicketReleased,
      notificationLink: finalNotificationPdf,
      pdfUrl: finalNotificationPdf,
      officialWebsite: websiteUrl.trim(),
      websiteUrl: websiteUrl.trim(),
      resultLink: resultUrl.trim(),
      resultUrl: resultUrl.trim(),
      resultReleased,
      featured,
      notificationPdf: finalNotificationPdf,
      status: isDraft ? 'draft' : 'published',
    };

    try {
      if (isEditMode && id) {
        await updateJob(id, jobData, isDraft);
        onShowToast(
          'Success',
          isDraft ? 'Job saved as draft' : 'Job updated successfully'
        );
      } else {
        await addJob(jobData, isDraft);
        onShowToast(
          'Success',
          isDraft ? 'Job saved as draft' : 'Job published successfully'
        );
      }
      // Redirect to All Jobs
      navigate('/admin/jobs');
    } catch (err) {
      console.error('Save to Firestore error:', err);
      onShowToast('Error', 'Failed to save job document to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout onShowToast={onShowToast}>
      <div className="p-4 sm:p-6 md:p-8 max-w-[1100px] w-full mx-auto space-y-6">
        {/* Header & Back Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-[#c4c6d0]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/jobs')}
              title="Back to All Jobs"
              className="p-2 border border-[#c4c6d0] rounded-xl bg-white hover:bg-[#eff4ff] transition text-[#0b1c30] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#00163d] font-headline">
                {isEditMode ? 'Edit Government Job Notification' : 'Post New Government Job Notification'}
              </h1>
              <p className="text-xs text-[#44464f]">
                {isEditMode
                  ? `Update circular parameters and verified official links for: ${title || id}`
                  : 'Create and publish an authenticated recruitment circular to Firestore database'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold border border-blue-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">database</span> Firestore Sync
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* SECTION 1: PRIMARY JOB DETAILS */}
          <div className="bg-white border border-[#c4c6d0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#c4c6d0]">
              <span className="material-symbols-outlined text-[#006398] text-xl">feed</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">
                1. Primary Recruitment Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-title">
                  Recruitment / Notification Title <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maharashtra Police Constable Recruitment 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-dept">
                  Department / Organization <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-dept"
                  type="text"
                  required
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  placeholder="e.g. Maharashtra State Police (Home Dept)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-category">
                  Recruitment Category <span className="text-rose-600">*</span>
                </label>
                <select
                  id="form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JobCategory)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none font-medium"
                >
                  <option value="Police Bharti">Police Bharti</option>
                  <option value="Army Bharti">Army Bharti</option>
                  <option value="Railway">Railway</option>
                  <option value="SSC">SSC</option>
                  <option value="Banking">Banking</option>
                  <option value="Maharashtra Govt">Maharashtra Govt</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-post">
                  Designation / Post Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-post"
                  type="text"
                  required
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  placeholder="e.g. Police Constable & Driver"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-vacancies">
                  Total Vacancies <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-vacancies"
                  type="number"
                  required
                  min={1}
                  value={vacancies}
                  onChange={(e) => setVacancies(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs font-mono font-bold text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ELIGIBILITY, SALARY & LOCATION */}
          <div className="bg-white border border-[#c4c6d0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#c4c6d0]">
              <span className="material-symbols-outlined text-[#006398] text-xl">school</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">
                2. Eligibility, Salary & Application Fee
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-qual">
                  Educational Qualification <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-qual"
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. 12th Pass / Graduate"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-age">
                  Age Limit (as per rules) <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-age"
                  type="text"
                  required
                  value={ageLimit}
                  onChange={(e) => setAgeLimit(e.target.value)}
                  placeholder="e.g. 18 - 28 Years"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-relaxation">
                  Age Relaxation Criteria
                </label>
                <input
                  id="form-relaxation"
                  type="text"
                  value={ageRelaxation}
                  onChange={(e) => setAgeRelaxation(e.target.value)}
                  placeholder="e.g. SC/ST: 5 Years, OBC: 3 Years"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-location">
                  Job Location <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Across Maharashtra"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-salary">
                  Salary / Pay Scale
                </label>
                <input
                  id="form-salary"
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. ₹21,700 - ₹69,100 (Level 3)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-fee">
                  Application Fee Structure
                </label>
                <input
                  id="form-fee"
                  type="text"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g. General: ₹450, Reserved: ₹350"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-physical">
                  Physical Requirements / Fitness Standards
                </label>
                <input
                  id="form-physical"
                  type="text"
                  value={physicalRequirements}
                  onChange={(e) => setPhysicalRequirements(e.target.value)}
                  placeholder="e.g. Male: Height 165cm, Chest 79-84cm | Female: Height 155cm"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: IMPORTANT DATES & SELECTION PROCESS */}
          <div className="bg-white border border-[#c4c6d0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#c4c6d0]">
              <span className="material-symbols-outlined text-[#006398] text-xl">event</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">
                3. Important Dates & Selection Stages
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-start">
                  Online Application Start Date
                </label>
                <input
                  id="form-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-last">
                  Last Date to Apply <span className="text-rose-600">*</span>
                </label>
                <input
                  id="form-last"
                  type="text"
                  required
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  placeholder="e.g. 30 Nov 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-exam">
                  Tentative Exam Date
                </label>
                <input
                  id="form-exam"
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  placeholder="e.g. December 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                />
              </div>
            </div>

            {/* Selection Stages */}
            <div className="text-xs">
              <label className="block font-bold text-[#0b1c30] mb-2">Selection Process Stages</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Physical Efficiency Test (PET/PST)',
                  'Written Examination (OMR/CBT)',
                  'Skill / Trade Test',
                  'Medical Examination',
                  'Document Verification',
                  'Interview / Viva',
                ].map((stageName) => (
                  <button
                    key={stageName}
                    type="button"
                    onClick={() => handleStageToggle(stageName)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      stages.includes(stageName)
                        ? 'bg-[#006398] text-white border-[#006398]'
                        : 'bg-white text-[#44464f] border-[#c4c6d0] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {stages.includes(stageName) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span>{stageName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="text-xs">
              <label className="block font-bold text-[#0b1c30] mb-2">
                Required Documents Checklist (Candidate Verification)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {docs.map((docName) => (
                  <span
                    key={docName}
                    className="inline-flex items-center gap-1.5 bg-[#eff4ff] border border-[#afc6ff]/40 text-[#006398] px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <span>{docName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(docName)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center gap-1 bg-white border border-[#c4c6d0] rounded-lg px-2 py-0.5">
                  <input
                    type="text"
                    value={newDocInput}
                    onChange={(e) => setNewDocInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDoc();
                      }
                    }}
                    placeholder="+ Add document"
                    className="border-none outline-none text-xs text-[#0b1c30] bg-transparent p-1 w-28"
                  />
                  {newDocInput && (
                    <button
                      type="button"
                      onClick={handleAddDoc}
                      className="text-[10px] bg-[#006398] text-white px-2 py-0.5 rounded cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* How to Apply Steps */}
            <div className="text-xs">
              <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-steps">
                How to Apply (Candidate Guidance Instructions)
              </label>
              <textarea
                id="form-steps"
                rows={3}
                value={howToApply}
                onChange={(e) => setHowToApply(e.target.value)}
                placeholder="Step 1: Register on portal&#10;Step 2: Upload documents..."
                className="w-full px-3.5 py-2.5 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
              />
            </div>
          </div>

          {/* SECTION 4: OFFICIAL LINKS & NOTIFICATION PDF */}
          <div className="bg-white border border-[#c4c6d0] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#c4c6d0]">
              <span className="material-symbols-outlined text-[#006398] text-xl">link</span>
              <h2 className="text-sm font-bold text-[#0b1c30] font-headline">
                4. Official Notification PDF & Dynamic URLs
              </h2>
            </div>

            {/* OFFICIAL NOTIFICATION PDF UPLOAD (FIREBASE STORAGE) */}
            <div className="p-4 sm:p-5 bg-[#eff4ff] border border-[#afc6ff]/50 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#00163d] block" htmlFor="notification-pdf-input">
                      Official Notification PDF
                    </label>
                    <p className="text-[11px] text-[#44464f]">
                      Upload the official recruitment advertisement circular (.pdf only, max 25 MB)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="notification-pdf-input"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition ${
                      isUploadingPdf
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#006398] hover:bg-[#00476e] text-white active:scale-98'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isUploadingPdf ? 'hourglass_top' : notificationPdfUrl ? 'sync' : 'upload_file'}
                    </span>
                    <span>
                      {isUploadingPdf
                        ? 'Uploading...'
                        : notificationPdfUrl
                        ? 'Replace Notification PDF'
                        : 'Choose Notification PDF'}
                    </span>
                    <input
                      id="notification-pdf-input"
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={isUploadingPdf}
                      onChange={handlePdfFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isUploadingPdf && (
                <div className="bg-white p-3.5 rounded-lg border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#006398] flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-[#006398] border-t-transparent rounded-full animate-spin"></span>
                      Uploading to Firebase Storage...
                    </span>
                    <span className="font-mono font-bold text-[#00163d]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                    <div
                      className="bg-[#006398] h-2 rounded-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  {selectedPdfFile && (
                    <p className="text-[11px] text-[#747780] truncate font-mono">
                      File: {selectedPdfFile.name} ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {/* Upload Success Message */}
              {uploadSuccessMessage && !isUploadingPdf && (
                <div className="flex items-center justify-between gap-2 bg-emerald-50 px-3.5 py-2.5 rounded-lg border border-emerald-300 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-emerald-600 text-base shrink-0">check_circle</span>
                    <span className="font-medium truncate">{uploadSuccessMessage}</span>
                  </div>
                  {notificationPdfUrl && (
                    <a
                      href={notificationPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Preview PDF</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  )}
                </div>
              )}

              {/* Upload Error Message */}
              {uploadErrorMessage && !isUploadingPdf && (
                <div className="flex items-center justify-between gap-2 bg-rose-50 px-3.5 py-2.5 rounded-lg border border-rose-300 text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-600 text-base shrink-0">error</span>
                    <span className="font-medium">{uploadErrorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Existing Uploaded PDF Display (for Edit mode or after successful upload) */}
              {notificationPdfUrl && !isUploadingPdf && !uploadSuccessMessage && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-lg border border-emerald-300 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-emerald-600 text-base shrink-0">task_alt</span>
                    <span className="font-semibold text-emerald-900">Attached Notification PDF:</span>
                    <span className="font-mono text-[11px] text-[#44464f] truncate max-w-xs md:max-w-md">
                      {notificationPdfUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={notificationPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition"
                    >
                      <span>View Current PDF</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationPdfUrl('');
                        setPdfUrl('');
                        setSelectedPdfFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-2 py-1 text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer"
                      title="Remove current PDF"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-applylink">
                  Apply Online Direct URL (applyLink) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-base">
                    open_in_browser
                  </span>
                  <input
                    id="form-applylink"
                    type="url"
                    required
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-pdflink">
                  Notification PDF URL (notificationLink)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-base">
                    picture_as_pdf
                  </span>
                  <input
                    id="form-pdflink"
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-admitcard">
                  Hall Ticket URL (hallTicketLink)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-base">
                    badge
                  </span>
                  <input
                    id="form-admitcard"
                    type="url"
                    value={hallTicketUrl}
                    onChange={(e) => setHallTicketUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-weblink">
                  Official Website URL (officialWebsite)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-base">
                    language
                  </span>
                  <input
                    id="form-weblink"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://mahapolice.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-[#0b1c30] mb-1.5" htmlFor="form-resultlink">
                  Official Selection Merit / Result URL (resultLink)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-base">
                    task_alt
                  </span>
                  <input
                    id="form-resultlink"
                    type="url"
                    value={resultUrl}
                    onChange={(e) => setResultUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#c4c6d0] rounded-lg text-xs text-[#0b1c30] focus:border-[#006398] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* RELEASE STATUS TOGGLES */}
            <div className="pt-3 border-t border-[#c4c6d0] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#c4c6d0] bg-[#f8f9ff] cursor-pointer hover:bg-[#eff4ff]">
                <input
                  type="checkbox"
                  checked={hallTicketReleased}
                  onChange={(e) => setHallTicketReleased(e.target.checked)}
                  className="w-4 h-4 text-[#006398] rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0b1c30] block">Hall Ticket Released</span>
                  <span className="text-[11px] text-[#747780]">
                    {hallTicketReleased ? 'Active for download' : 'Show "Not Released Yet"'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#c4c6d0] bg-[#f8f9ff] cursor-pointer hover:bg-[#eff4ff]">
                <input
                  type="checkbox"
                  checked={resultReleased}
                  onChange={(e) => setResultReleased(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0b1c30] block">Result Declared</span>
                  <span className="text-[11px] text-[#747780]">
                    {resultReleased ? 'Active for viewing' : 'Show "Not Released Yet"'}
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#c4c6d0] bg-[#f8f9ff] cursor-pointer hover:bg-[#eff4ff]">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <div>
                  <span className="font-bold text-[#0b1c30] block">Featured Circular</span>
                  <span className="text-[11px] text-[#747780]">Pin to top banner on portal</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons: Publish / Save Draft */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
              className="w-full sm:w-auto bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c4c6d0] py-2.5 px-6 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-60"
            >
              Save as Draft (Unpublished)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#c2410c] hover:bg-[#9a3412] text-white py-2.5 px-8 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                    publish
                  </span>
                  <span>{isEditMode ? 'Update & Publish Changes' : 'Publish Job to Live Portal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
