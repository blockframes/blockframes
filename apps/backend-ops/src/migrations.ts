/**
 * This module deal with migrating the system from a CURRENT version
 * to the LAST version.
 */
import { Firestore } from './admin';
import { last } from 'lodash';
import { IMigrationWithVersion, MIGRATIONS, VERSIONS_NUMBERS } from './firestoreMigrations';

export const VERSION_ZERO = 0;

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
    upgrade: MIGRATIONS[version].update
  }));
}

export async function migrate(db: Firestore) {
  console.info('start the migration process...');

  // TODO: disable the database updates

  // TODO: trigger backup
  try {
    const currentVersion = await loadDBVersion(db);
    const migrations = selectAndOrderMigrations(currentVersion);
    const lastVersion = last(migrations).version;

    console.info(`Running ${migrations.length} between ]${currentVersion}, ${lastVersion}]`);

    for (const migration of migrations) {
      console.info(`applying migration: ${migration.version}`);
      await migration.upgrade(db);
      console.info(`done applying migration: ${migration.version}`);
    }

    await updateDBVersion(db, lastVersion);
  } catch (e) {
    console.error("the migration failed, revert'ing!");
    // TOOD: trigger restore on error
  }

  // TODO: reenable updates

  console.info('end the migration process...');
}
