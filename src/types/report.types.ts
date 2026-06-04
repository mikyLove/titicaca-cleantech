export type ReportStatus = "pending" | "in_review" | "resolved" | "rejected";

export interface Report {
  id: string;
  title: string;
  description: string;
  location: string | null;
  image_url: string | null;
  user_id: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  location?: string;
  file?: File;
}
