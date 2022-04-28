import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!
import { endMaintenance, keepAlive, loadAdminServices, startMaintenance, warnMissingVars } from '@blockframes/firebase-utils';
warnMissingVars()

import { generateFixtures } from './generate-fixtures';
import { exportFirestore } from './admin';
import {
  healthCheck,
  migrate,
  disableMaintenanceMode,
  displayCredentials,
  isMigrationRequired,
  showHelp,
  upgradeAlgoliaMovies,
  upgradeAlgoliaOrgs,
  upgradeAlgoliaUsers,
  clearUsers,
  createUsers,
  printUsers,
  syncUsers,
  importFirestore,
  selectEnvironment,
  anonymizeLatestProdDb,
  downloadProdDbBackup,
  importEmulatorFromBucket,
  loadEmulator,
  enableMaintenanceInEmulator,
  uploadBackup,
  startEmulators,
  syncAuthEmulatorWithFirestoreEmulator,
  backupLiveEnv,
  restoreLiveEnv,
  rescueJWP,
  loadAndShrinkLatestAnonDbAndUpload,
  cleanBackups,
  auditUsers,
  prepareForTesting,
  upgrade,
  prepareEmulators,
  upgradeEmulators,
  printDatabaseInconsistencies
} from '@blockframes/devops';

const args = process.argv.slice(2);
const [cmd, ...flags] = args;
const [arg1, arg2] = flags;

async function runCommand() {
  const { db } = loadAdminServices();
  switch (cmd) {
    case 'prepareForTesting':
      await prepareForTesting({ dbBackupURL: arg1 });
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
      await prepareEmulators({ dbBackupURL: arg1 });
      break;
    case 'cleanBackups':
      await cleanBackups({ maxDays: arg1, bucketName: arg2 });
      break;
    case 'anonProdDb':
      await keepAlive(anonymizeLatestProdDb());
      break;
    case 'shrinkDb':
      await loadAndShrinkLatestAnonDbAndUpload();
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
    case 'generateFixtures':
      await generateFixtures(db);
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
    case 'auditDatabaseConsistency':
      await printDatabaseInconsistencies(undefined, db);
      break;
    case 'upgradeEmulators':
      await upgradeEmulators();
      break;
    case 'exportFirestore':
      await exportFirestore(arg1)
      break;
    case 'importFirestore':
      await importFirestore(arg1)
      break;
    case 'restoreEnv':
      await startMaintenance(db);
      await restoreLiveEnv();
      await endMaintenance(db);
      break
    case 'backupEnv':
      await backupLiveEnv()
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
    case 'syncAuthEmulatorWithFirestoreEmulator':
      await syncAuthEmulatorWithFirestoreEmulator({ importFrom: arg1 });
      break;
    case 'syncUsers':
      await startMaintenance(db);
      await syncUsers();
      await endMaintenance(db);
      break;
    case 'printUsers':
      await printUsers();
      break;
    case 'auditUsers':
      await auditUsers(db);
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
      await rescueJWP({ jwplayerKey: arg1, jwplayerApiV2Secret: arg2 });
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
