import { prepareForTesting } from './firebaseSetup';
import { migrate } from './migrations';
import { exitable, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs } from './algolia';
import { syncUsers } from './users';

async function migrateToV3() {
  const { db } = loadAdminServices();
  // this upgradeV3 function name will change when we automatize migration script
  await upgradeV3(db).then(() => process.exit(0));
}

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

if (cmd === 'prepareForTesting') {
  exitable(prepareForTesting)();
} else if (cmd === 'migrate') {
  exitable(migrate)();
} else if (cmd === 'syncUsers') {
  exitable(syncUsers)();
} else if (cmd === 'upgradeAlgoliaOrgs') {
  exitable(upgradeAlgoliaOrgs)();
} else if (cmd === 'upgradeAlgoliaMovies') {
  exitable(upgradeAlgoliaMovies)();
} else {
  showHelp();
  process.exit(1);
}
