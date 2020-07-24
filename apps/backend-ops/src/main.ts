import 'tsconfig-paths/register'; // This is so it can be run via ts-node

import { prepareForTesting, restoreShortcut, upgrade } from './firebaseSetup';
import { migrate } from './migrations';
import { exitable, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { clearUsers, createUsers, printUsers, syncUsers } from './users';
import { generateFixturesFile } from './anon-firestore';

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

switch (cmd) {
  case 'generateFixturesFile':
    exitable(generateFixturesFile)();
    break;
  case 'prepareForTesting':
    exitable(prepareForTesting)();
    break;
  case 'upgrade':
    exitable(upgrade)();
    break;
  case 'restore':
    exitable(restoreShortcut)();
    break;
  case 'migrate':
    exitable(migrate)();
    break;
  case 'syncUsers':
    exitable(syncUsers)();
    break;
  case 'printUsers':
    exitable(printUsers)();
    break;
  case 'clearUsers':
    exitable(clearUsers)();
    break;
  case 'createUsers':
    exitable(createUsers)();
    break;
  case 'upgradeAlgoliaOrgs':
    exitable(upgradeAlgoliaOrgs)();
    break;
  case 'upgradeAlgoliaMovies':
    exitable(upgradeAlgoliaMovies)();
    break;
  case 'upgradeAlgoliaUsers':
    exitable(upgradeAlgoliaUsers)();
    break;
  default:
    showHelp();
    process.exit(1);
    break;
}
