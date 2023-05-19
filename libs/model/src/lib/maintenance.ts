export interface IMaintenanceDoc {
  endedAt: Date;
  startedAt: Date;
}

export interface IVersionDoc {
  currentVersion: number | string;
}

export interface IAlgoliaKeyDoc {
  key: string;
}