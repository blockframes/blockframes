import { createAllUsers, prepareFirebase, trashAllOtherUsers } from './firebaseSetup';
import { MIGRATIONS } from './firestoreMigrations';
import { updateDBVersion } from './migrations';
import { loadAdminServices } from './admin';
import { USERS } from './users.toronto.fixture';

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
  process.exit(0);
}

async function prepareToronto() {
  const { auth } = loadAdminServices();
  console.info('create all users...');
  await createAllUsers(USERS, auth);
  console.info('clearing other users...');
  await trashAllOtherUsers(USERS, auth);
  console.info('done.');
  process.exit(0);
}

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

if (cmd === 'prepareForTesting') {
  prepareForTesting();
} else if (cmd === 'migrateToV1') {
  migrateToV1();
} else if (cmd === 'prepareToronto') {
  prepareToronto();
}
