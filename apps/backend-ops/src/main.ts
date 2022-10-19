import 'tsconfig-paths/register';
import { config } from 'dotenv';
config(); // * Must be run here!
import { endMaintenance, startMaintenance, warnMissingVars, getDb } from '@blockframes/firebase-utils';
warnMissingVars();

import {
  exportFirestoreToBucketBeta,
  healthCheck,
  migrate,
  displayCredentials,
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
  uploadBackup,
  startEmulators,
  syncAuthEmulatorWithFirestoreEmulator,
  rescueJWP,
  loadAndShrinkLatestAnonDbAndUpload,
  cleanBackups,
  auditUsers,
  prepareForTesting,
  upgrade,
  prepareEmulators,
  upgradeEmulators,
  printDatabaseInconsistencies,
  keepAlive,
  generateFixtures,
  writeRuntimeConfig,
  functionsConfigMap,
  clearDb,
  updateUsersPassword
} from '@blockframes/devops';
import { join } from 'path';

const args = process.argv.slice(2);
const [cmd, ...flags] = args;
const [arg1, arg2] = flags;

async function runCommand() {
  const db = getDb();
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
    case 'log':
      console.log(...flags);
      break;
    case 'emulatorsUnitTests':
      await startEmulators({ execCommand: arg1, emulators: ['auth', 'firestore'], importData: false });
      break;
    case 'emulatorsE2E':
      await startEmulators({ importFrom: arg1, emulators: ['auth', 'functions', 'firestore', 'pubsub', 'storage'] });
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
    case 'use':
      await selectEnvironment(arg1);
      break;
    case 'generateFixtures':
      await generateFixtures(db);
      break;
    case 'upgrade':
      await upgrade();
      break;
    case 'auditDatabaseConsistency':
      await printDatabaseInconsistencies(undefined, db);
      break;
    case 'upgradeEmulators':
      await upgradeEmulators();
      break;
    case 'exportFirestore':
      await exportFirestoreToBucketBeta(arg1);
      break;
    case 'importFirestore':
      await importFirestore(arg1);
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
      await migrate({ withMaintenance: true });
      break;
    case 'syncAuthEmulatorWithFirestoreEmulator':
      await syncAuthEmulatorWithFirestoreEmulator({ importFrom: arg1 });
      break;
    case 'syncUsers':
      await syncUsers({ withMaintenance: true });
      break;
    case 'printUsers':
      await printUsers();
      break;
    case 'auditUsers':
      await auditUsers(db);
      break;
    case 'clearUsers':
      await clearUsers();
      break;
    case 'createUsers':
      await createUsers();
      break;
    case 'updateUsersPassword':
      await updateUsersPassword(arg1, arg2);
      break;
    case 'clearDb':
      await clearDb(db, false);
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
    case 'writeRuntimeConfig':
      writeRuntimeConfig(functionsConfigMap, join(process.cwd(), './.runtimeconfig.json'));
      break;
    default:
      return Promise.reject('Command Args not detected... exiting..');
  }
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
