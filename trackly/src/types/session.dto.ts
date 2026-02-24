export interface ActiveSessionDTO {
  id: number;
  project_id: number | null;
  start_time: string;
  end_time: string | null;
  description: string | null;
  status: "running" | "finished" | "cancelled";
}

export interface FinishedSessionDTO {
  id: number;
  project_id: number | null;
  start_time: string;
  end_time: string;
  description: string | null;
  tags: string[];
}