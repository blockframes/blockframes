/**
 * This module deal with migrating the system from a CURRENT version
 * to the LAST version.
 */
import { backup, restore } from './admin';
import { Firestore, loadAdminServices, IMigrationWithVersion, MIGRATIONS, VERSIONS_NUMBERS } from "@blockframes/firebase-utils";
import { last } from 'lodash';
import { appUrl } from '@env';
import { endMaintenance, startMaintenance } from '@blockframes/firebase-utils';

export const VERSION_ZERO = 2;

export interface IVersionDoc {
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
  const doc = await versionRef.get();

  if (!doc.exists) {
    return versionRef.set({ currentVersion: version });
  } else {
    return versionRef.update({ currentVersion: version });
  }
}

function selectAndOrderMigrations(afterVersion: number): IMigrationWithVersion[] {
  const versions = VERSIONS_NUMBERS.filter(version => version > afterVersion);

  return versions.map(version => ({
    version,
    upgrade: MIGRATIONS[version].upgrade
  }));
}

export async function migrate(withBackup: boolean = true) {
  console.info('start the migration process...');
  const { db, storage } = loadAdminServices();

  try {
    await startMaintenance();

    const currentVersion = await loadDBVersion(db);
    const migrations = selectAndOrderMigrations(currentVersion);

    if (migrations.length === 0) {
      console.info('No migrations to run, leaving...');
      return;
    }

    if (withBackup) {
      console.info('backup the database before doing anything');
      await backup(appUrl.content);
      console.info('backup done, moving on to the migrations...');
    } else {
      console.warn('⚠️ skipping the backup before running migrations, are you sure?');
    }

    const lastVersion = last(migrations).version;

    console.info(`Running migrations: ${migrations.map(x => x.version).join(', ')}`);

    for (const migration of migrations) {
      console.info(`applying migration: ${migration.version}`);
      await migration.upgrade(db, storage);
      console.info(`done applying migration: ${migration.version}`);
    }

    await updateDBVersion(db, lastVersion);
  } catch (e) {
    console.error(e);
    console.error('the migration failed, revert\'ing!');
    await restore(appUrl.content);
    throw e;
  } finally {
    if (withBackup) {
      console.info('running a backup post-migration');
      await backup(appUrl.content);
      console.info('done with the backup post-migration');
    }
    await endMaintenance();
    console.info('end the migration process...');
  }
}
