import { prepareFirebase } from './firebaseSetup';
import { MIGRATIONS } from './firestoreMigrations';
import { updateDBVersion } from './migrations';
import { loadAdminServices } from './admin';

async function prepareForTesting() {
  console.info('Preparing firebase...');
  await prepareFirebase();
  console.info('Firebase ready for testing!');
  process.exit(0);
}

async function migrateToV1() {
  // NOTE: this is draft stage, the whole select the migration / enter / upgrade should be automated.
  console.info('migrating to v1...');
  const { db } = loadAdminServices();
  await MIGRATIONS['1'].upgrade(db);
  await updateDBVersion(db, 1);
}

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

if (cmd === 'prepareForTesting') {
  prepareForTesting();
} else if (cmd === 'migrateToV1') {
  migrateToV1();
}
