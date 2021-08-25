import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!
import { endMaintenance, loadAdminServices, startMaintenance, warnMissingVars } from '@blockframes/firebase-utils';
warnMissingVars()

import { prepareDb, prepareStorage, prepareForTesting, upgrade, prepareEmulators } from './firebaseSetup';
import { migrate } from './migrations';
import { disableMaintenanceMode, displayCredentials, isMigrationRequired, showHelp } from './tools';
import { upgradeAlgoliaMovies, upgradeAlgoliaOrgs, upgradeAlgoliaUsers } from './algolia';
import { clearUsers, createUsers, printUsers, generateWatermarks, syncUsers } from './users';
import { generateFixtures } from './generate-fixtures';
import { exportFirestore, importFirestore } from './admin';
import { selectEnvironment } from './select-environment';
import { healthCheck } from './health-check';
import { anonymizeLatestProdDb, downloadProdDbBackup, importEmulatorFromBucket, loadEmulator, enableMaintenanceInEmulator, uploadBackup, startEmulators } from './emulator';
import { backupEnv, restoreEnv } from './backup';
import { EIGHT_MINUTES_IN_MS } from '@blockframes/utils/maintenance';
import { rescueJWP } from './rescueJWP';
import { shrinkDb } from './db-shrink';

const args = process.argv.slice(2);
const [cmd, ...flags] = args;
const [arg1, arg2] = flags;

async function runCommand() {
  const { db } = loadAdminServices();
  switch (cmd) {
    case 'prepareForTesting':
      await startMaintenance(db);
      await prepareForTesting();
      await endMaintenance(db, EIGHT_MINUTES_IN_MS);
      break;
    case 'displayCredentials':
      await displayCredentials();
      break;
    case 'loadEmulator':
      await loadEmulator({ importFrom: arg1 });
      break;
    case 'importEmulator':
      await importEmulatorFromBucket({ importFrom: arg1 });
      break;
    case 'startEmulators':
    case 'emulators':
      await startEmulators({ importFrom: arg1 });
      break;
    case 'prepareEmulators':
      await prepareEmulators();
      break;
    case 'anonProdDb':
      await anonymizeLatestProdDb();
      break;
    case 'shrinkDb':
      await shrinkDb();
      break;
    case 'downloadProdDbBackup':
      await downloadProdDbBackup(arg1);
      break;
    case 'uploadToBucket':
      await uploadBackup({ remoteDir: arg1, localRelPath: arg2 });
      break;
    case 'enableMaintenanceInEmulator':
      await enableMaintenanceInEmulator({ importFrom: arg1 });
      break;
    case 'use':
      await selectEnvironment(arg1);
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
    case 'exportFirestore':
      await exportFirestore(arg1)
      break;
    case 'importFirestore':
      await importFirestore(arg1)
      break;
    case 'restoreEnv':
      await startMaintenance(db);
      await restoreEnv();
      await endMaintenance(db);
      break
    case 'backupEnv':
      await backupEnv()
      break
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
    case 'rescueJWP':
      await rescueJWP();
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
    console.error('ERROR!\n', e);
    console.timeEnd(consoleMsg);
    process.exit(1);
  });
