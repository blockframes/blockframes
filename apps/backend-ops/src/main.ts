import { createAllUsers, prepareFirebase, removeUnexpectedUsers } from './firebaseSetup';
import { MIGRATIONS } from './firestoreMigrations';
import { updateDBVersion } from './migrations';
import { loadAdminServices } from './admin';
import { USERS } from './users.toronto.fixture';
import { storeSearchableOrg } from '../../backend-functions/src/internals/algolia';

async function prepareForTesting() {
  console.info('Preparing firebase...');
  await prepareFirebase();
  console.info('Firebase ready for testing!');

  console.info('Preparing Algolia...');
  await upgradeAlgoliaOrgs();
  console.info('Algolia ready for testing!');

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

async function upgradeAlgoliaOrgs() {
  const { db } = loadAdminServices();
  const orgs = await db.collection('orgs').get();

  const promises = [];
  orgs.forEach(org => {
    const { id, name } = org.data();
    promises.push(storeSearchableOrg(id, name, process.env['ALGOLIA_API_KEY']));
  });

  return Promise.all(promises);
}

async function prepareToronto() {
  const { auth } = loadAdminServices();
  console.info('clearing other users...');
  await removeUnexpectedUsers(USERS, auth);
  console.info('create all users...');
  await createAllUsers(USERS, auth);
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
} else if (cmd === 'upgradeAlgoliaOrgs') {
  upgradeAlgoliaOrgs();
}
