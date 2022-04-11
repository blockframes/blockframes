import type { Timestamp } from './timestamp';

export interface IMaintenanceDoc {
  endedAt: Timestamp;
  startedAt: Timestamp;
}

export interface IVersionDoc {
  currentVersion: number;
}