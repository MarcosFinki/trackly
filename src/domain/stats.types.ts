/**
 * Minimal contract required for stats calculations
 */
export interface SessionForStats {
  startTime: Date;
  endTime: Date;
  tags: string[];
}