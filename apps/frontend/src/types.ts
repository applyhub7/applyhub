export type UserRole = "candidate" | "recruiter";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
};

export type Job = {
  id: string;
  title: string;
  companyId: string;
  location: string;
  description: string;
  status: string;
};

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  resumeFileName?: string;
  resumeObjectKey?: string;
  resumeDownloadUrl?: string;
  status: string;
};
