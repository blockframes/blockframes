import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!
import { endMaintenance, loadAdminServices, startMaintenance, warnMissingVars } from '@blockframes/firebase-utils';
warnMissingVars()

import { prepareForTesting, restore, upgrade, prepareDb, prepareStorage } from './firebaseSetup';
import { migrate } from './migrations';
import { disableMaintenanceMode, displayCredentials, isMigrationRequired, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { clearUsers, createUsers, printUsers, generateWatermarks, syncUsers } from './users';
import { generateFixtures } from './generate-fixtures';
import { backup } from './admin';
import { selectEnvironment } from './select-environment';
import { healthCheck } from './health-check';
import { importEmulatorFromBucket } from './emulator';

const args = process.argv.slice(2);
const [cmd, ...flags] = args;

async function runCommand() {
  const { db } = loadAdminServices();
  switch (cmd) {
    case 'prepareForTesting':
      await startMaintenance(db);
      await prepareForTesting();
      await endMaintenance(db);
      break;
    case 'displayCredentials':
      await displayCredentials();
      break;
    case 'importEmulator':
      await importEmulatorFromBucket(flags.pop());
      break;
    case 'use':
      await selectEnvironment(flags.pop());
      break;
    case 'prepareDb':
      await startMaintenance(db);
      await prepareDb();
      await endMaintenance(db);
      break;
    case 'prepareStorage':
      await startMaintenance(db);
      await prepareStorage();
      await endMaintenance(db);
      break;
    case 'generateFixtures':
      await generateFixtures();
      break;
    case 'upgrade':
      if (!await isMigrationRequired()) {
        console.log('Skipping upgrade because migration is not required...');
        return;
      }
      await startMaintenance(db);
      await upgrade();
      await endMaintenance(db);
      break;
    case 'backup':
      await backup();
      break;
    case 'restore':
      await startMaintenance(db);
      await restore();
      await endMaintenance(db);
      break;
    case 'startMaintenance':
      await startMaintenance();
      break;
    case 'endMaintenance':
      await endMaintenance();
      break;
    case 'healthCheck':
      await healthCheck();
      break;
    case 'migrate':
      if (!await isMigrationRequired()) {
        console.log('Skipping because there is no migration to run...');
        return;
      }
      await startMaintenance(db);
      await migrate();
      await endMaintenance(db);
      break;
    case 'syncUsers':
      await startMaintenance(db);
      await syncUsers();
      await endMaintenance(db);
      break;
    case 'printUsers':
      await printUsers();
      break;
    case 'clearUsers':
      await startMaintenance(db);
      await clearUsers();
      await endMaintenance(db);
      break;
    case 'createUsers':
      await startMaintenance(db);
      await createUsers();
      await endMaintenance(db);
      break;
    case 'generateWatermarks':
      await generateWatermarks();
      break;
    case 'upgradeAlgoliaOrgs':
      await upgradeAlgoliaOrgs();
      break;
    case 'upgradeAlgoliaMovies':
      await upgradeAlgoliaMovies();
      break;
    case 'upgradeAlgoliaUsers':
      await upgradeAlgoliaUsers();
      break;
    default:
      showHelp();
      await Promise.reject('Command not recognised');
      break;
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
