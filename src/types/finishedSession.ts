export interface FinishedSession {
  id: number;
  projectId: number | null;
  startTime: Date;
  endTime: Date;
  description: string | null;
  tags: string[];
}