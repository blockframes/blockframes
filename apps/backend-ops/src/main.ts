import { restore, syncUsers } from './firebaseSetup';
import { MIGRATIONS } from './firestoreMigrations';
import { updateDBVersion } from './migrations';
import { loadAdminServices } from './admin';
import { USERS as USERS_TORONTO } from './users.toronto.fixture';
import { USERS } from './users.fixture';
import {
  storeSearchableOrg,
  storeSearchableMovie
} from '../../backend-functions/src/internals/algolia';
import { firebase } from '@env';
import { updateInvitationDocument, updateOrganizationDocument } from './firestoreMigrations/ToV2';

async function prepareForTesting() {
  console.info('Syncing users...');
  await syncUsers(USERS_TORONTO);
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
  await syncUsers(USERS_TORONTO);
  console.info('done.');
  process.exit(0);
}

async function upgradeAlgoliaMovies() {
  const { db } = loadAdminServices();
  const movies = await db.collection('movies').get();

  const promises = [];
  movies.forEach(movie => {
    promises.push(storeSearchableMovie(movie.data(), process.env['ALGOLIA_API_KEY']));
  });
  return Promise.all(promises);
}

function upgradeToV2() {
  const { db } = loadAdminServices();
  updateInvitationDocument(db);
  updateOrganizationDocument(db);
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
} else if (cmd === 'syncUsers') {
  syncUsers(USERS).then(() => process.exit(0));
} else if (cmd === 'upgradeAlgoliaMovies') {
  upgradeAlgoliaMovies();
} else if (cmd === 'prepareToV2') {
  prepareToV2();
}
