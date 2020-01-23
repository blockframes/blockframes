import { prepareForTesting, upgrade } from './firebaseSetup';
import { migrate } from './migrations';
import { exitable, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs } from './algolia';
import { clearUsers, createUsers, printUsers, syncUsers } from './users';

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

if (cmd === 'prepareForTesting') {
  exitable(prepareForTesting)();
} else if (cmd === 'upgrade') {
  exitable(upgrade)();
} else if (cmd === 'migrate') {
  exitable(migrate)();
} else if (cmd === 'syncUsers') {
  exitable(syncUsers)();
} else if (cmd === 'printUsers') {
  exitable(printUsers)();
} else if (cmd === 'clearUsers') {
  exitable(clearUsers)();
} else if (cmd === 'createUsers') {
  exitable(createUsers)();
} else if (cmd === 'upgradeAlgoliaOrgs') {
  exitable(upgradeAlgoliaOrgs)();
} else if (cmd === 'upgradeAlgoliaMovies') {
  exitable(upgradeAlgoliaMovies)();
} else {
  showHelp();
  process.exit(1);
}
