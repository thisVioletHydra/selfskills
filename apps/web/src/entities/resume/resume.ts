export type ResumeJob = {
  id: string;
  period: string;
  duration: string;
  company: string;
  location: string;
  url?: string;
  industry?: string;
  role: string;
  productNote?: string;
  productExampleUrl?: string;
  stack: string[];
  highlights: string[];
};

export type ResumeEducation = {
  level: string;
  school: string;
  details: string;
};

export type ResumeInfo = {
  phone: string;
  email: string;
  experienceYears: string;
  education: ResumeEducation;
  skills: string[];
  jobs: ResumeJob[];
};
