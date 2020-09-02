import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!

import { prepareForTesting, restoreShortcut, upgrade, prepareInParallel } from './firebaseSetup';
import { migrate } from './migrations';
import { exitable, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { clearUsers, createUsers, printUsers, syncUsers, generateWatermarks } from './users';
import { generateFixtures } from "./generate-fixtures";
import { syncStorage } from './syncStorage';

const args = process.argv.slice(2);
const [cmd, ...rest] = args;

if (cmd === 'prepareForTesting') {
  exitable(prepareForTesting)();
} else if (cmd === 'prepareInParallel') {
  exitable(prepareInParallel)();
} else if (cmd === 'generateFixtures') {
  exitable(generateFixtures)();
} else if (cmd === 'upgrade') {
  exitable(upgrade)();
} else if (cmd === 'restore') {
  exitable(restoreShortcut)();
} else if (cmd === 'migrate') {
  exitable(migrate)();
} else if (cmd === 'printUsers') {
  exitable(printUsers)();
} else if (cmd === 'clearUsers') {
  exitable(clearUsers)();
} else if (cmd === 'createUsers') {
  exitable(createUsers)();
} else if (cmd === 'generateWatermarks') {
  exitable(generateWatermarks)();
} else if (cmd === 'upgradeAlgoliaOrgs') {
  exitable(upgradeAlgoliaOrgs)();
} else if (cmd === 'upgradeAlgoliaMovies') {
  exitable(upgradeAlgoliaMovies)();
} else if (cmd === 'upgradeAlgoliaUsers') {
  exitable(upgradeAlgoliaUsers)();
} else if (cmd === 'syncStorage') {
  exitable(syncStorage)();
} else {
  showHelp();
  process.exit(1);
}
