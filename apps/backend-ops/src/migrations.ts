import { Firestore } from './admin';

export const VERSION_ZERO = 0;

export interface VersionDoc {
  currentVersion: number;
}

export async function loadDBVersion(db: Firestore): Promise<number> {
  const version = await db
    .collection('_META')
    .doc('_VERSION')
    .get();

  if (!version.exists) {
    return VERSION_ZERO;
  }

  return version.data().currentVersion;
}

export async function updateDBVersion(db: Firestore, version: number): Promise<any> {
  const versionRef = await db.collection('_META').doc('_VERSION');
  return versionRef.update({ currentVersion: version });
}
