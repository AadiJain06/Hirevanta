export interface JobDTO {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  description: string;
  responsibilities: string | null;
  salaryRange: string | null;
  tags: string[];
  status: string;
  isSample: boolean;
  createdAt: string;
}

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
  retryAfter?: number;
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;
