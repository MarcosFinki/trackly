export interface ActiveSession {
  id: number;
  projectId: number | null;
  startTime: Date;
  endTime: Date | null;
  description: string | null;
  status: "running" | "finished" | "cancelled";
}

export interface FinishedSession {
  id: number;
  projectId: number | null;
  startTime: Date;
  endTime: Date;
  description: string | null;
  tags: string[];
}