import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!
import { endMaintenance, loadAdminServices, startMaintenance, warnMissingVars } from '@blockframes/firebase-utils';
warnMissingVars()

import { prepareForTesting, restore, upgrade, prepareDb, prepareStorage } from './firebaseSetup';
import { migrate } from './migrations';
import { disableMaintenanceMode, displayCredentials, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { clearUsers, createUsers, printUsers, generateWatermarks, syncUsers } from './users';
import { generateFixtures } from './generate-fixtures';
import { backup } from './admin';
import { selectEnvironment } from './select-environment';
import { healthCheck } from './health-check';

const args = process.argv.slice(2);
const [cmd, ...flags] = args;

async function runCommand() {
  const { db } = loadAdminServices();
  if (cmd === 'prepareForTesting') {
    await startMaintenance(db);
    const output = await prepareForTesting();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'displayCredentials') {
    return displayCredentials();
  } else if (cmd === 'use') {
    return selectEnvironment(flags.pop());
  } else if (cmd === 'prepareDb') {
    await startMaintenance(db);
    const output = await prepareDb();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'prepareStorage') {
    await startMaintenance(db);
    const output = await prepareStorage();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'generateFixtures') {
    return generateFixtures();
  } else if (cmd === 'upgrade') {
    await startMaintenance(db);
    const output = await upgrade();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'backup') {
    return backup();
  } else if (cmd === 'restore') {
    await startMaintenance(db);
    const output = await restore();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'startMaintenance') {
    return startMaintenance();
  } else if (cmd === 'endMaintenance') {
    return endMaintenance();
  } else if (cmd === 'healthCheck') {
    return healthCheck();
  } else if (cmd === 'migrate') {
    await startMaintenance(db);
    const output = await migrate();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'syncUsers') {
    await startMaintenance(db);
    const output = await syncUsers();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'printUsers') {
    return printUsers();
  } else if (cmd === 'clearUsers') {
    await startMaintenance(db);
    const output = await clearUsers();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'createUsers') {
    await startMaintenance(db);
    const output = await createUsers();
    await endMaintenance(db);
    return output;
  } else if (cmd === 'generateWatermarks') {
    return generateWatermarks();
  } else if (cmd === 'upgradeAlgoliaOrgs') {
    return upgradeAlgoliaOrgs();
  } else if (cmd === 'upgradeAlgoliaMovies') {
    return upgradeAlgoliaMovies();
  } else if (cmd === 'upgradeAlgoliaUsers') {
    return upgradeAlgoliaUsers();
  } else {
    showHelp();
    return Promise.reject('Command not recognised');
  }
}

function hasFlag(compare: string) {
  return flags.some(flag => flag === compare) || flags.some(flag => flag === `--${compare}`)
}

if (hasFlag('skipMaintenance')) {
  console.warn('WARNING! BLOCKFRAMES_MAINTENANCE_DISABLED is set to true')
  disableMaintenanceMode()
}

const consoleMsg = `Time running command "${cmd}"`;
console.time(consoleMsg);
runCommand()
  .then(() => {
    console.timeEnd(consoleMsg);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    console.timeEnd(consoleMsg);
    process.exit(1);
  });
