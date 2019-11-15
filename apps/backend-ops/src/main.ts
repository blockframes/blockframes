import { prepareFirebase, restore, syncUsers } from './firebaseSetup';
import { MIGRATIONS } from './firestoreMigrations';
import { updateDBVersion } from './migrations';
import { loadAdminServices } from './admin';
import { USERS } from './users.toronto.fixture';
import { storeSearchableOrg } from '../../backend-functions/src/internals/algolia';
import { firebase } from '@env';

async function prepareForTesting() {
  console.info('Syncing users...');
  await syncUsers(USERS);
  console.info('Users synced!');

  console.info('Restoring backup...');
  await restore(firebase.projectId);
  console.info('backup restored!');

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
  await syncUsers(USERS);
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
