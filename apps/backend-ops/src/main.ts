import { prepareForTesting } from './firebaseSetup';
import { migrate } from './migrations';
import { exitable, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs } from './algolia';
import { syncUsers } from './users';

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
