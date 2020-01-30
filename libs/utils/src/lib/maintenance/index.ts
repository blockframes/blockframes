import { firestore } from "firebase";

export interface IMaintenanceDoc {
  endedAt:firestore.Timestamp
  startedAt: firestore.Timestamp
}

/** Delay before considering the maintenance over */
export const delay = 30 * 1000;  // 30sec in ms
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
  throw new Error(
    'Unexpected cases for maintenance check! please check the _META/_MAINTENANCE document.'
  );
}