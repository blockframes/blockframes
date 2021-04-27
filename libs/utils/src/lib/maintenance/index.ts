import firebase from 'firebase/app';
import 'firebase/firestore';

export interface IMaintenanceDoc {
  endedAt: firebase.firestore.Timestamp
  startedAt: firebase.firestore.Timestamp
}

export interface IVersionDoc {
  currentVersion: number;
}

/** Delay before considering the maintenance over */
export const META_COLLECTION_NAME = '_META';
export const MAINTENANCE_DOCUMENT_NAME = '_MAINTENANCE';
export const DB_DOCUMENT_NAME = '_VERSION'

export const metaDoc = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;
export const dbVersionDoc = `${META_COLLECTION_NAME}/${DB_DOCUMENT_NAME}`;

export function _isInMaintenance({ endedAt, startedAt }: IMaintenanceDoc): boolean {
  try {
    const now = firebase.firestore.Timestamp.now();

    if (startedAt) {
      return true;
    }

    if (endedAt) {
      return endedAt.toMillis() > now.toMillis();
    }

    // We shouldn't throw here else if this happen it create cache issues
    console.error('Unexpected cases for maintenance check! please check the _META/_MAINTENANCE document.');

    return true;
  } catch (e) {
    console.error(`Error while checking if app is in maintenance : ${e.message}`);
    return true;
  }
}
