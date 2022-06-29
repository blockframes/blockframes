/**
 * This module deal with migrating the system from a CURRENT version
 * to the LAST version.
 */
import { importFirestore } from './admin';
import { Firestore, startMaintenance, endMaintenance } from '@blockframes/firebase-utils';
import { IMigrationWithVersion, MIGRATIONS, VERSIONS_NUMBERS } from './firestoreMigrations';
import { last } from 'lodash';
import { dbVersionDoc, DB_DOCUMENT_NAME, META_COLLECTION_NAME } from '@blockframes/utils/maintenance';
import { exportFirestoreToBucketBeta, getFirestoreExportDirname } from './firebase-utils';
import { isMigrationRequired } from './tools';
import { getDb, getStorage } from '@blockframes/firebase-utils/initialize';

export const VERSION_ZERO = 2;

export async function loadDBVersion(db: Firestore): Promise<number> {
  const version = await db.doc(dbVersionDoc).get();

  if (!version.exists) {
    return VERSION_ZERO;
  }
  return version.data().currentVersion;
}

export async function updateDBVersion(db: Firestore, version: number) {
  const versionRef = db.collection(META_COLLECTION_NAME).doc(DB_DOCUMENT_NAME);
  const doc = await versionRef.get();

  if (!doc.exists) {
    return versionRef.set({ currentVersion: version });
  } else {
    return versionRef.update({ currentVersion: version });
  }
}

export function selectAndOrderMigrations(afterVersion: number): IMigrationWithVersion[] {
  const versions = VERSIONS_NUMBERS.filter(version => version > afterVersion);

  return versions.map(version => ({
    version,
    upgrade: MIGRATIONS[version].upgrade
  }));
}

export async function migrate({
  withBackup = true,
  db = getDb(),
  storage = getStorage(),
  performMigrationCheck = true,
  withMaintenance = false
}: {
  withBackup?: boolean;
  db?: FirebaseFirestore.Firestore;
  storage?: import('firebase-admin').storage.Storage;
  performMigrationCheck?: boolean,
  withMaintenance?: boolean
} = {}) {

  if (performMigrationCheck && !await isMigrationRequired(db)) {
    console.log('Skipping because there is no migration to run...');
    return;
  }

  if (withMaintenance) await startMaintenance(db);
  console.info('Start the migration process...');

  const backupDir = `pre-migration-${getFirestoreExportDirname(new Date())}`;

  try {
    const currentVersion = await loadDBVersion(db);
    const migrations = selectAndOrderMigrations(currentVersion);

    if (migrations.length === 0) {
      console.info('No migrations to run, leaving...');
      return;
    }

    if (withBackup) {
      console.info('Backup the database before doing anything');
      await exportFirestoreToBucketBeta(backupDir);
      console.info('Backup done, moving on to the migrations...');
    } else {
      console.warn('⚠️ skipping the backup before running migrations!');
    }

    const lastVersion = last(migrations).version;

    console.info(`Running migrations: ${migrations.map((x) => x.version).join(', ')}`);

    for (const migration of migrations) {
      console.info(`Running migration: ${migration.version}`);
      await migration.upgrade(db, storage);
      console.info(`Done running migration: ${migration.version}`);
    }

    await updateDBVersion(db, lastVersion);
    if (withMaintenance) await endMaintenance(db);
  } catch (e) {
    console.error(e);
    if (withBackup) {
      console.error('Migration failed. Restoring pre-migration backup...');
      await importFirestore(backupDir, { allowProd: true });
    }
    throw e;
  } finally {
    if (withBackup) {
      console.info('Running a backup post-migration');
      await exportFirestoreToBucketBeta(`post-migration-${getFirestoreExportDirname(new Date())}`);
      console.info('Done with the backup post-migration');
    }
    console.info('Data model version migration complete!');
  }
}
