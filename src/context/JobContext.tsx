import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Job } from '../types';

interface JobContextType {
  jobs: Job[];
  jobsLoading: boolean;
  getJobById: (id: string) => Job | undefined;
  fetchJobById: (id: string) => Promise<Job | undefined>;
  addJob: (jobData: Partial<Job>, isDraft?: boolean) => Promise<Job>;
  updateJob: (id: string, jobData: Partial<Job>, isDraft?: boolean) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  toggleJobStatus: (id: string) => Promise<void>;
  isAdminAuthenticated: boolean;
  authLoading: boolean;
  adminUser: User | null;
  loginAdmin: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  language: 'en' | 'mr';
  toggleLanguage: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

function mapDocToJob(docSnap: any): Job {
  const data = docSnap.data();
  const rawStatus = data.status || 'published';
  const postName = data.postName || '';
  const title = data.title || '';
  const dept = data.department || data.dept || 'Government of Maharashtra';
  const vacancies = typeof data.vacancies === 'number' ? data.vacancies : Number(data.vacancies) || 0;
  const qualification = data.qualification || 'As per official notification';
  const ageLimit = data.ageLimit || '18 - 38 Years';
  const lastDate = data.lastDate || 'Check Notification';

  return {
    id: docSnap.id,
    title,
    department: dept,
    dept,
    category: data.category || 'Maharashtra Govt',
    postName,
    vacancies,
    qualification,
    ageLimit,
    ageRelaxation: data.ageRelaxation || '',
    salary: data.salary || 'As per 7th Pay Commission',
    applicationFee: data.applicationFee || data.fee || 'Check notification',
    fee: data.applicationFee || data.fee || 'Check notification',
    location: data.location || 'All Maharashtra',
    startDate: data.startDate || '',
    lastDate,
    examDate: data.examDate || '',
    selectionProcess: data.selectionProcess || '',
    physicalRequirements: data.physicalRequirements || '',
    documentsRequired: data.documentsRequired || '',
    howToApply: typeof data.howToApply === 'string'
      ? data.howToApply.split('\n').filter(Boolean)
      : (Array.isArray(data.howToApply) ? data.howToApply : []),
    applyLink: data.applyLink || data.applyUrl || '',
    applyUrl: data.applyLink || data.applyUrl || '',
    hallTicketLink: data.hallTicketLink || data.hallTicketUrl || '',
    hallTicketUrl: data.hallTicketLink || data.hallTicketUrl || '',
    notificationLink: data.notificationLink || data.pdfUrl || '',
    pdfUrl: data.notificationLink || data.pdfUrl || '',
    officialWebsite: data.officialWebsite || data.websiteUrl || '',
    websiteUrl: data.officialWebsite || data.websiteUrl || '',
    resultLink: data.resultLink || data.resultUrl || '',
    resultUrl: data.resultLink || data.resultUrl || '',
    hallTicketReleased: Boolean(data.hallTicketReleased),
    resultReleased: Boolean(data.resultReleased),
    featured: Boolean(data.featured),
    status: rawStatus,
    notificationPdf: data.notificationPdf || '',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    daysLeftText: 'Active',
    hallTicketStatus: data.hallTicketReleased ? 'Available Now' : 'Not Released Yet',
    selectionStages: typeof data.selectionProcess === 'string'
      ? data.selectionProcess.split('\n').filter(Boolean)
      : (Array.isArray(data.selectionProcess) ? data.selectionProcess : []),
    requiredDocs: typeof data.documentsRequired === 'string'
      ? data.documentsRequired.split('\n').filter(Boolean)
      : (Array.isArray(data.documentsRequired) ? data.documentsRequired : []),
    isExpiringSoon: false,
  };
}

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mahanaukri_admin_auth') === 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);

  const [language, setLanguage] = useState<'en' | 'mr'>('en');

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdminAuthenticated(true);
        setAdminUser(user);
        localStorage.setItem('mahanaukri_admin_auth', 'true');
      } else {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
        localStorage.removeItem('mahanaukri_admin_auth');
        localStorage.removeItem('mahanaukri_admin_token');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Live Firestore database synchronization for recruitment jobs
  useEffect(() => {
    setJobsLoading(true);

    // If admin is authenticated, subscribe to all jobs (drafts and published)
    // If public user, query only published jobs (status == "published")
    const jobsTarget = isAdminAuthenticated
      ? collection(db, 'jobs')
      : query(collection(db, 'jobs'), where('status', '==', 'published'));

    const unsubscribe = onSnapshot(
      jobsTarget,
      (snapshot) => {
        const mappedList = snapshot.docs.map(mapDocToJob);
        // Sort descending by creation date
        mappedList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setJobs(mappedList);
        setJobsLoading(false);
      },
      (error) => {
        setJobsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'jobs');
      }
    );

    return () => unsubscribe();
  }, [isAdminAuthenticated]);

  const getJobById = (id: string): Job | undefined => {
    return jobs.find((j) => j.id === id);
  };

  const fetchJobById = async (id: string): Promise<Job | undefined> => {
    const cached = jobs.find((j) => j.id === id);
    if (cached) return cached;
    try {
      const snap = await getDoc(doc(db, 'jobs', id));
      if (snap.exists()) {
        return mapDocToJob(snap);
      }
    } catch (error) {
      console.warn('Error fetching job by ID from Firestore:', error);
    }
    return undefined;
  };

  const addJob = async (jobData: Partial<Job>, isDraft = false): Promise<Job> => {
    const cleanSlug = (jobData.title || 'job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 45);
    const newDocId = jobData.id || `${cleanSlug || 'job'}-${Date.now().toString().slice(-5)}`;
    const nowIso = new Date().toISOString();
    const statusVal = isDraft ? 'draft' : (jobData.status || 'published');

    const departmentName = (jobData.department || jobData.dept || 'Government of Maharashtra').trim();
    const titleName = (jobData.title || '').trim();
    const postName = (jobData.postName || '').trim();
    const categoryName = jobData.category || 'Maharashtra Govt';

    const newJobDoc = {
      title: titleName,
      department: departmentName,
      category: categoryName,
      postName: postName,
      vacancies: Number(jobData.vacancies) || 0,
      qualification: jobData.qualification || 'As per official notification',
      ageLimit: jobData.ageLimit || '18 - 38 Years',
      ageRelaxation: jobData.ageRelaxation || '',
      salary: jobData.salary || 'As per 7th Pay Commission',
      applicationFee: jobData.applicationFee || jobData.fee || '',
      location: jobData.location || 'All Maharashtra',
      startDate: jobData.startDate || new Date().toISOString().split('T')[0],
      lastDate: jobData.lastDate || 'To be announced',
      examDate: jobData.examDate || '',
      selectionProcess: typeof jobData.selectionProcess === 'string'
        ? jobData.selectionProcess
        : (Array.isArray(jobData.selectionStages) ? jobData.selectionStages.join('\n') : ''),
      physicalRequirements: jobData.physicalRequirements || '',
      documentsRequired: typeof jobData.documentsRequired === 'string'
        ? jobData.documentsRequired
        : (Array.isArray(jobData.requiredDocs) ? jobData.requiredDocs.join('\n') : ''),
      howToApply: typeof jobData.howToApply === 'string'
        ? jobData.howToApply
        : (Array.isArray(jobData.howToApply) ? jobData.howToApply.join('\n') : ''),
      applyLink: jobData.applyLink || jobData.applyUrl || '',
      hallTicketLink: jobData.hallTicketLink || jobData.hallTicketUrl || '',
      notificationLink: jobData.notificationLink || jobData.pdfUrl || '',
      officialWebsite: jobData.officialWebsite || jobData.websiteUrl || '',
      resultLink: jobData.resultLink || jobData.resultUrl || '',
      hallTicketReleased: Boolean(jobData.hallTicketReleased),
      resultReleased: Boolean(jobData.resultReleased),
      featured: Boolean(jobData.featured),
      status: statusVal,
      notificationPdf: jobData.notificationPdf || '',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'jobs', newDocId), newJobDoc);
      return mapDocToJob({ id: newDocId, data: () => newJobDoc });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `jobs/${newDocId}`);
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>, isDraft = false): Promise<void> => {
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      updatedAt: nowIso,
    };

    if (jobData.title !== undefined) updatePayload.title = jobData.title.trim();
    if (jobData.department !== undefined || jobData.dept !== undefined) {
      updatePayload.department = (jobData.department || jobData.dept || '').trim();
    }
    if (jobData.category !== undefined) updatePayload.category = jobData.category;
    if (jobData.postName !== undefined) updatePayload.postName = jobData.postName.trim();
    if (jobData.vacancies !== undefined) updatePayload.vacancies = Number(jobData.vacancies) || 0;
    if (jobData.qualification !== undefined) updatePayload.qualification = jobData.qualification;
    if (jobData.ageLimit !== undefined) updatePayload.ageLimit = jobData.ageLimit;
    if (jobData.ageRelaxation !== undefined) updatePayload.ageRelaxation = jobData.ageRelaxation;
    if (jobData.salary !== undefined) updatePayload.salary = jobData.salary;
    if (jobData.applicationFee !== undefined || jobData.fee !== undefined) {
      updatePayload.applicationFee = jobData.applicationFee || jobData.fee || '';
    }
    if (jobData.location !== undefined) updatePayload.location = jobData.location;
    if (jobData.startDate !== undefined) updatePayload.startDate = jobData.startDate;
    if (jobData.lastDate !== undefined) updatePayload.lastDate = jobData.lastDate;
    if (jobData.examDate !== undefined) updatePayload.examDate = jobData.examDate;
    if (jobData.selectionProcess !== undefined || jobData.selectionStages !== undefined) {
      updatePayload.selectionProcess = typeof jobData.selectionProcess === 'string'
        ? jobData.selectionProcess
        : (Array.isArray(jobData.selectionStages) ? jobData.selectionStages.join('\n') : '');
    }
    if (jobData.physicalRequirements !== undefined) updatePayload.physicalRequirements = jobData.physicalRequirements;
    if (jobData.documentsRequired !== undefined || jobData.requiredDocs !== undefined) {
      updatePayload.documentsRequired = typeof jobData.documentsRequired === 'string'
        ? jobData.documentsRequired
        : (Array.isArray(jobData.requiredDocs) ? jobData.requiredDocs.join('\n') : '');
    }
    if (jobData.howToApply !== undefined) {
      updatePayload.howToApply = typeof jobData.howToApply === 'string'
        ? jobData.howToApply
        : (Array.isArray(jobData.howToApply) ? jobData.howToApply.join('\n') : '');
    }
    if (jobData.applyLink !== undefined || jobData.applyUrl !== undefined) {
      updatePayload.applyLink = jobData.applyLink || jobData.applyUrl || '';
    }
    if (jobData.hallTicketLink !== undefined || jobData.hallTicketUrl !== undefined) {
      updatePayload.hallTicketLink = jobData.hallTicketLink || jobData.hallTicketUrl || '';
    }
    if (jobData.notificationLink !== undefined || jobData.pdfUrl !== undefined) {
      updatePayload.notificationLink = jobData.notificationLink || jobData.pdfUrl || '';
    }
    if (jobData.officialWebsite !== undefined || jobData.websiteUrl !== undefined) {
      updatePayload.officialWebsite = jobData.officialWebsite || jobData.websiteUrl || '';
    }
    if (jobData.resultLink !== undefined || jobData.resultUrl !== undefined) {
      updatePayload.resultLink = jobData.resultLink || jobData.resultUrl || '';
    }
    if (jobData.hallTicketReleased !== undefined) updatePayload.hallTicketReleased = Boolean(jobData.hallTicketReleased);
    if (jobData.resultReleased !== undefined) updatePayload.resultReleased = Boolean(jobData.resultReleased);
    if (jobData.featured !== undefined) updatePayload.featured = Boolean(jobData.featured);
    if (isDraft) {
      updatePayload.status = 'draft';
    } else if (jobData.status !== undefined) {
      updatePayload.status = jobData.status;
    }
    if (jobData.notificationPdf !== undefined) updatePayload.notificationPdf = jobData.notificationPdf;

    try {
      await updateDoc(doc(db, 'jobs', id), updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${id}`);
    }
  };

  const deleteJob = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `jobs/${id}`);
    }
  };

  const toggleJobStatus = async (id: string): Promise<void> => {
    const target = jobs.find((j) => j.id === id);
    if (!target) return;
    const newStatus = target.status === 'published' ? 'draft' : 'published';
    try {
      await updateDoc(doc(db, 'jobs', id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${id}`);
    }
  };

  const loginAdmin = async (
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmed = usernameOrEmail.trim();
      const email = trimmed.includes('@') ? trimmed : `${trimmed}@mahanaukri.in`;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsAdminAuthenticated(true);
      setAdminUser(userCredential.user);
      localStorage.setItem('mahanaukri_admin_auth', 'true');
      return { success: true };
    } catch (err: unknown) {
      console.error('Firebase Authentication Login Error:', err);
      let errorMsg = 'Invalid email or password. Please verify credentials.';
      const firebaseError = err as { code?: string; message?: string };
      const code = firebaseError?.code;

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        errorMsg = 'Invalid username/email or password.';
      } else if (code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (code === 'auth/user-disabled') {
        errorMsg = 'This admin account has been disabled.';
      } else if (code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Access is temporarily locked. Try again later.';
      } else if (code === 'auth/network-request-failed') {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      } else if (code === 'auth/operation-not-allowed') {
        errorMsg = 'Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider.';
      } else if (firebaseError?.message) {
        errorMsg = firebaseError.message.replace(/^Firebase:\s*/, '');
      }

      return {
        success: false,
        error: errorMsg,
      };
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase SignOut Error:', err);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      localStorage.removeItem('mahanaukri_admin_auth');
      localStorage.removeItem('mahanaukri_admin_token');
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        jobsLoading,
        getJobById,
        fetchJobById,
        addJob,
        updateJob,
        deleteJob,
        toggleJobStatus,
        isAdminAuthenticated,
        authLoading,
        adminUser,
        loginAdmin,
        logoutAdmin,
        language,
        toggleLanguage,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
