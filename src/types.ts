export type JobCategory = 
  | 'Police Bharti' 
  | 'Army Bharti' 
  | 'Railway' 
  | 'SSC' 
  | 'Banking' 
  | 'Maharashtra Govt';

export type JobStatus = 'published' | 'draft' | 'archived' | 'active' | 'expiring_soon' | 'hall_ticket_out';

export interface VacancyBreakdown {
  open: number;
  obc: number;
  sc: number;
  st: number;
  ews: number;
  sebc: number;
}

export interface Job {
  id: string;
  title: string;
  department?: string;
  dept?: string; // alias for department
  category: JobCategory | string;
  postName: string;
  vacancies: number;
  qualification: string;
  ageLimit: string;
  ageRelaxation?: string;
  salary?: string;
  applicationFee?: string;
  fee?: string; // alias for applicationFee
  location?: string;
  startDate?: string;
  lastDate: string;
  examDate?: string;
  selectionProcess?: string | string[];
  physicalRequirements?: string;
  documentsRequired?: string | string[];
  howToApply?: string | string[];

  // Direct recruitment links
  applyLink?: string;
  applyUrl?: string; // alias
  hallTicketLink?: string;
  hallTicketUrl?: string; // alias
  notificationLink?: string;
  pdfUrl?: string; // alias
  officialWebsite?: string;
  websiteUrl?: string; // alias
  resultLink?: string;
  resultUrl?: string; // alias

  hallTicketReleased?: boolean;
  resultReleased?: boolean;
  featured?: boolean;
  status: 'published' | 'draft' | 'archived' | string;
  notificationPdf?: string;

  createdAt?: string;
  updatedAt?: string;

  // Optional portal UI helpers
  daysLeftText?: string;
  advtNo?: string;
  hallTicketStatus?: 'Available Now' | 'Not Released Yet' | 'Released';
  vacancyBreakdown?: VacancyBreakdown;
  selectionStages?: string[];
  requiredDocs?: string[];
  isExpiringSoon?: boolean;
}

export type AppView = 
  | 'portal' 
  | 'job-detail' 
  | 'admin-login' 
  | 'admin-dashboard' 
  | 'admin-add-job';

export type Language = 'en' | 'mr';
