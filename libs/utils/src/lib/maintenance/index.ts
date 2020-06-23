import { firestore } from 'firebase/app';

export interface IMaintenanceDoc {
  endedAt:firestore.Timestamp
  startedAt: firestore.Timestamp
}

/** Delay before considering the maintenance over */
export const delay = 8 * 60 * 1000;  // 8 minutes in ms
export const maintenancePath = '_META/_MAINTENANCE';

export function isInMaintenance({ endedAt, startedAt }: IMaintenanceDoc): boolean {
  const now = firestore.Timestamp.now();
  if (endedAt) {
    // Wait 30s before allowing any operation on the db.
    // this prevents triggering firebase events.
    // NOTE: this is hack-ish but good enough for our needs! we'll revisit this later.
    return endedAt.toMillis() + delay > now.toMillis();
  }
  if (startedAt) {
    return true;
  }
  // We shouldn't throw here else if this happen it create cache issues
  console.error('Unexpected cases for maintenance check! please check the _META/_MAINTENANCE document.');
}