import { firebase } from '@env'
import { initializeApp } from 'firebase-admin'
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { ChildProcess, execSync } from 'child_process';
import { Dirent, existsSync, mkdirSync, readdirSync, rmdirSync, writeFileSync, renameSync } from 'fs';
import { join, resolve, sep } from 'path';
import { runShellCommand, runShellCommandUntil, awaitProcOutput, gsutilTransfer } from '../commands';
import { getFirestoreExportDirname } from './export';
import { sleep, throwOnProduction } from '../util';
import type * as firebaseTools from 'firebase-tools';
import { promises } from 'fs';
import _ from 'lodash';
const { writeFile, rename } = promises;

const firestoreExportFolder = 'firestore_export'; // ! Careful - changing this may cause a bug
const emulatorMetadataFilename = 'firebase-export-metadata.json';

export const getFirestoreExportPath = (emulatorPath: string) => join(emulatorPath, firestoreExportFolder);
const getEmulatorMetadataJsonPath = (emulatorPath: string) => join(emulatorPath, 'firebase-export-metadata.json');

/**
 * This function will get the filename of the Firestore export metadata json file.
 * @param firestorePath absolute path to a Firestore export
 */
function getFirestoreMetadataJsonFilename(firestorePath: string) {
  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  return fileSearch.find((file) => file.isFile()).name;
}

/**
 * This is a "default" path used by scripts and commands to store Firestore backups when running
 * various processes, such as PFT or db anonymization.
 */
export const defaultEmulatorBackupPath = join(process.cwd(), '.firebase', 'emulator');

/**
 * This function will download and convert a Firestore export saved in a GCS bucket to
 * a local format compatible with the Firebase emulator.
 * @param gcsPath full GCS bucket URI to Firestore export
 * @param emulatorBackupPath local path to root Firebase emulator export directory
 */
export async function importFirestoreEmulatorBackup(gcsPath: string, emulatorBackupPath: string) {
  const firestoreBackupPath = getFirestoreExportPath(emulatorBackupPath);
  const trailingSlash = gcsPath.charAt(gcsPath.length - 1) === sep;
  if (trailingSlash) gcsPath = gcsPath.slice(0, -1);
  if (!existsSync(emulatorBackupPath)) mkdirSync(firestoreBackupPath, { recursive: true });
  else {
    rmdirSync(emulatorBackupPath, { recursive: true });
    mkdirSync(firestoreBackupPath, { recursive: true });
  }

  await gsutilTransfer({
    from: gcsPath,
    to: firestoreBackupPath,
  });

  createEmulatorMetadataJson(emulatorBackupPath);
}

const emulatorNames = ['auth', 'functions', 'firestore', 'database', 'hosting', 'pubsub', 'storage'];
type EmulatorNames = typeof emulatorNames[number];

interface FirebaseEmulatorSettings {
  /**
   * If you want to run a shell command via emulator command, specify it here otherwise
   * emulator will run with 'start'
   */
  execCommand?: string;
  /**
   * Specify a custom (or demo) project ID here. Defaults to Firebase config in env.ts
   */
  projectId?: string;
  /**
   * Specify the name of the emulator you want to start or an array of names - defaults to all.
   */
  emulators?: EmulatorNames | EmulatorNames[];
  /**
   * If you want to import data from backup, specify a path here
   */
  importPath?: string;
  /**
   * If you want to update backup export on shutdown, set to true. You can also set a path for
   * an alternate export location. Cannot be set to true if there is no import path set as well.
   */
  exportData?: boolean | string;
}

export async function firebaseEmulatorExec({
  emulators = emulatorNames,
  execCommand,
  exportData = false,
  importPath,
  projectId = firebase().projectId
}: FirebaseEmulatorSettings = {}) {

  function isOrHasValue<T, K extends T | T[]>(input: K, testValue: T) {
    const result = input === testValue || (input instanceof Array && input.find((name) => name === testValue))
    return Boolean(result);
  }

  if (isOrHasValue(emulators, 'functions')) {
    // * If functions has been selected, write project config to .runtimeConfig file in root of repo dir

    await writeRuntimeConfig(functionsConfigMap, join(process.cwd(), './.runtimeconfig.json'));
    await writeRuntimeConfig(functionsConfigMap, join(process.cwd(), './dist/apps/backend-functions/.runtimeconfig.json'));
    // * Keep the below until we know we don't need to programmatically access firebase tools
    // console.log('Writing Firebase Functions config secrets to .runtimeConfig');
    // try {
    //   const FIREBASE_CONFIG: firebaseTools.FirebaseConfig = { project: projectId };
    //   if (process.env.FIREBASE_CI_TOKEN) FIREBASE_CONFIG.token = process.env.FIREBASE_CI_TOKEN; // * Check if we are in CI
    //   const firebaseTools = eval('require')('firebase-tools') as firebaseTools; // * Lazy load not to bundle dep in functions compilation
    //   const configObj = await firebaseTools.functions.config.get(undefined, FIREBASE_CONFIG);
    //   await writeFile(
    //     join(process.cwd(), './.runtimeconfig.json'),
    //     JSON.stringify(configObj, null, 4),
    //     'utf-8'
    //   );
    // } catch (e) {
    //   console.error(e);
    // }

  }

  if ((isOrHasValue(emulators, 'firestore') || isOrHasValue(emulators, 'auth') || isOrHasValue(emulators, 'storage')) && importPath) {
    // * we are running emulators that need a backup location
    await ensureSafeEmulatorBackupPath(importPath)
  }

  if (isOrHasValue(emulators, 'firestore') && isEmulatorBackupDir(importPath)) {
    if (emulatorBackupDirHasFirestore(importPath)) {
      console.log('Firestore backup detected correctly.');
    } else {
      console.warn('Looks like we are in a emulator backup that is missing Firestore backup. This will crash the emulator, backing up and clearing dir');
      const backupPath =
        importPath.charAt(importPath.length - 1) === sep
          ? `${importPath.slice(0, -1)}${new Date().getTime()}`
          : `${importPath}${new Date().getTime()}`;
      await rename(importPath, backupPath);
      console.log('Dir backed up');
    }
  }

  const startType = execCommand ? 'exec' : 'start';
  const onlyParam = typeof emulators === 'string' ? emulators : emulators.join(',');
  const exportString = typeof exportData === 'string' ? `--export-on-exit ${exportData} ` : '--export-on-exit ';
  const cmd = `npx firebase emulators:${startType} --project ${projectId} --only ${onlyParam} ${
    importPath ? `--import ${importPath} ` : ''
  }${exportData ? exportString : ''}${execCommand ? `'${execCommand}'` : ''}`;
  console.log('Running command:', cmd);
  const { proc, procPromise } = runShellCommandUntil(cmd, 'All emulators ready');
  process.on('SIGINT', async () => await shutdownEmulator(proc));
  await procPromise;
  return proc;
}

/**
 * This function will generate a Firestore emulator metadata file when given a directory
 * that contains a Firestore export. This is necessary for converting live Firestore backups
 * to local emulator-readable format.
 * @param emuPath path to the root emulator export folder
 */
function createEmulatorMetadataJson(emuPath: string) {
  const firestorePath = getFirestoreExportPath(emuPath);
  if (!isFirestoreBackupDir(firestorePath)) throw Error('Cannot find valid metadata file/Firestore export dir');
  const firebaseVersion = execSync('firebase -V').toString().split('\n').shift();
  const firestoreEmulatorVersion = '1.11.7';

  const fileSearch: Dirent[] = readdirSync(firestorePath, { withFileTypes: true });
  const firestoreMetadataFile = fileSearch.find((file) => file.isFile()).name;

  const emulatorObj = {
    version: firebaseVersion,
    firestore: {
      version: firestoreEmulatorVersion,
      path: firestoreExportFolder,
      metadata_file: join(firestoreExportFolder, firestoreMetadataFile),
    },
  };

  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(emuPath);
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorObj, null, 4), 'utf-8');
}

/**
 * This function returns a promise that will resolve when the emulator has
 * successfully shut down.
 * @param proc the `ChildPRocess` object for the running emulator process.
 * @param timeLimit number of seconds to await gracefull shutdown before SIGKILL
 */
export async function shutdownEmulator(proc: ChildProcess, exportDir = defaultEmulatorBackupPath, timeLimit: number = 30) {
  if (!proc) {
    console.warn('Kill emulator process cannot run as there is no process');
    return;
  }
  proc.kill('SIGTERM');
  const emuP = awaitProcOutput(proc, 'Stopping Logging Emulator').then(() => true);
  const timeP = sleep(1000 * timeLimit).then(() => false);
  const emuTerminated = await Promise.race([emuP, timeP]);
  if (!emuTerminated) {
    console.error('Unable to shut down emulator process, forcing export and killing emulator...');
    await forceEmulatorExport(exportDir);
    proc.kill('SIGKILL');
  }
}

function forceEmulatorExport(exportDir = defaultEmulatorBackupPath) {
  const cmd = `firebase emulators:export ${exportDir} --force`
  return runShellCommand(cmd);
}

export type FirestoreEmulator = FirebaseFirestore.Firestore & { clearFirestoreData?: typeof clearFirestoreData; };

let db;
let auth;

export function connectFirestoreEmulator() {
  throwOnProduction();
  if (db) return db;

  const firebaseJsonPath = resolve(process.cwd(), 'firebase.json');
  try {
    const {
      emulators: {
        firestore: { port: dbPort },
        storage: { port: storagePort },
        auth: { port: authPort },
      },
    } = eval('require')(firebaseJsonPath);

    console.log('Detected - dbPort:', dbPort, 'storagePort:', storagePort, 'authPort:', authPort);

    process.env['FIRESTORE_EMULATOR_HOST'] = `localhost:${dbPort}`;
  } catch (e) {
    process.env['FIRESTORE_EMULATOR_HOST'] = `localhost:8080`;
  }

  const app = initializeApp({ projectId: firebase().projectId }, 'firestore');
  db = app.firestore() as FirestoreEmulator;

  db.settings({
    // port: dbPort,
    merge: true,
    ignoreUndefinedProperties: true,
    host: 'localhost',
    ssl: false,
  });
  db.clearFirestoreData = clearFirestoreData;
  return db;
}

export function connectAuthEmulator() {
  if (auth) return auth;
  const firebaseJsonPath = resolve(process.cwd(), 'firebase.json')
  try {
    const {
      emulators: {
        auth: { port: authPort },
      },
    } = eval('require')(firebaseJsonPath);
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `localhost:${authPort}`;
  } catch (e) {
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = `localhost:9099`;
  }


  const app = initializeApp({ projectId: firebase().projectId }, 'auth');
  auth = app.auth();

  return auth;
}

/**
 * This function will process a local firestore export and upload it to a storage bucket.
 * The metadata format for GCS firestore backups is slightly different, and the foldername must match the
 * metadata filename, and so this function ensures these conditions are met, and then uploads the converted
 * export to a bucket with the correct directory name.
 *
 * @param param0 object provides three settings -  `bucketName`, `remoteDir`, `localPath`.
 *
 * The `bucketName` is the name of the bucket without the URI prefix (gs://).
 *
 * `remoteDir` is the name of the directory to upload to in specified bucket, without a trailing slash.
 *
 * `localPath` is the local relative or absolute path where to find a FIRESTORE (not Firebase emulator) backup folder
 */
export async function uploadDbBackupToBucket({ bucketName, remoteDir, localPath }: { bucketName: string; remoteDir?: string; localPath?: string; }) {
  console.log('Uploading local Firestore backup to bucket. Converting from emulator format to Firestore format.');
  console.log('Bucket:', bucketName);

  const firestoreExportAbsPath = localPath
    ? resolve(localPath)
    : getFirestoreExportPath(defaultEmulatorBackupPath);
  console.log('Local Firestore backup directory path:', firestoreExportAbsPath);
  if (!isFirestoreBackupDir(firestoreExportAbsPath)) throw Error('Firestore backup metadata file not found.');

  const firestoreMetadataFilename = getFirestoreMetadataJsonFilename(firestoreExportAbsPath);
  const firestoreMetadataAbsPath = join(firestoreExportAbsPath, firestoreMetadataFilename);

  remoteDir = remoteDir ?? getFirestoreExportDirname(new Date);
  console.log('Remote directory:', remoteDir)

  // * Must rename metadata file to have same name as containing directory when uploaded
  const newFirestoreMetaFilename = `${remoteDir.split(sep).pop()}.overall_export_metadata`;
  const newFirestoreMetadataAbsPath = join(firestoreExportAbsPath, newFirestoreMetaFilename);
  renameSync(firestoreMetadataAbsPath, newFirestoreMetadataAbsPath);

  // * Find parent folder and update Firebase emulator backup metadata file in case we want to use it again in emulator
  const folderArray = firestoreExportAbsPath.split(sep);
  const firestoreFolderName = folderArray.pop();
  const parentFolderAbsPath = folderArray.join(sep);
  const emulatorMetadataJsonPath = getEmulatorMetadataJsonPath(parentFolderAbsPath);
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(emulatorMetadataJsonPath);
  emulatorMetaData.firestore.metadata_file = join(firestoreFolderName, newFirestoreMetaFilename);
  writeFileSync(emulatorMetadataJsonPath, JSON.stringify(emulatorMetaData, null, 4), 'utf-8');

  if (!remoteDir) throw Error('remoteDir is empty... this will clear the entire bucket!');

  await gsutilTransfer({
    mirror: true,
    from: firestoreExportAbsPath,
    to: `gs://${bucketName}/${remoteDir}`,
  });
}

function isFirestoreBackupDir(path: string) {
  const fileSearch: Dirent[] = readdirSync(resolve(path), { withFileTypes: true });
  let metadataFile: string;
  try {
    metadataFile = fileSearch.find((file) => file.isFile()).name;
  } catch (e) {
    return false;
  }
  return metadataFile.split('.').pop() === 'overall_export_metadata';
}

function emulatorBackupDirHasFirestore(backupDir: string) {
  // * If not emulator dir, fail
  if (!isEmulatorBackupDir(backupDir)) return false;

  // * If pointed firestore metadata file does not exist, fail
  // tslint:disable-next-line: no-eval
  const emulatorMetaData = eval('require')(resolve(backupDir, emulatorMetadataFilename));
  const firestoreBackupDir = resolve(backupDir, emulatorMetaData.firestore.path);
  if (!existsSync(resolve(backupDir, emulatorMetaData.firestore.metadata_file))) return false;

  // * If pointed firestore dir does not have correct metadata file extension, fail
  if (!isFirestoreBackupDir(firestoreBackupDir)) return false;

  return true;
}

function isEmulatorBackupDir(path: string) {
  const absPath = resolve(path);
  const fileSearch: Dirent[] = existsSync(absPath) && readdirSync(absPath, { withFileTypes: true });
  let singleFileFound: string;
  try {
    singleFileFound = fileSearch.find((file) => file.isFile()).name;
  } catch (e) {
    // * If no file is found, fail
    return false;
  }
  // * If single file does not have correct name for metadata file, fail
  if (singleFileFound !== emulatorMetadataFilename) return false;

  return true;
}

async function ensureSafeEmulatorBackupPath(importPath: string) {
  if (!isEmulatorBackupDir(importPath)) {
    // * Is not an existing backup
    if (!existsSync(resolve(importPath))) {
      // * Dir doesnt exist, will be generated automatically
      console.log('Emulator backup path does not exist (yet).')
    } else if (readdirSync(resolve(importPath)).length !== 0) {
      // * If dir does exist but it is not an emulator backup dir, it should be empty to prevent writing backup to bad path
      // * Dir exists but is not empty and is not a backup dir
      console.warn('WARNING! Firestore backup either corrupt, non-existent or the wrong path, please delete or clear the following dir:', importPath);
      throw Error('Emulator data import path does not point to an emulator backup directory! \n' + importPath);
    }
  }
}

/**
 * This function will write a runtimeconfig.json file to the given path
 * based on provided values
 * @param values object with key value pairs representing values to be written
 * @param path path to write file
 * @returns a promise that resolves when runtimeconfig.json is written
 */
export function writeRuntimeConfig(values: { [key: string]: string }, path: string) {
  const runtimeObj = {};
  Object.entries(values).forEach(([key, value]) => _.set(runtimeObj, key, process.env[value] || 'missing-env-value'));
  return writeFile(path, JSON.stringify(runtimeObj, null, 4));
}

/**
 * This tuple array maps field names to the environment variable key to set them to for runtimeconfig.json and
 * firebase secrets
 */
export const functionsConfigMap: Record<string, string> = {
  'sendgrid.api_key': 'SENDGRID_API_KEY',// @see https://www.notion.so/cascade8/Setup-SendGrid-c8c6011ad88447169cebe1f65044abf0
  'jwplayer.key': 'JWPLAYER_KEY',// @see https://www.notion.so/cascade8/Setup-JWPlayer-2276fce57b464b329f0b6d2e7c6d9f1d
  'jwplayer.secret': 'JWPLAYER_SECRET',
  'jwplayer.apiv2secret': 'JWPLAYER_APIV2SECRET',
  'algolia.api_key': 'ALGOLIA_API_KEY',
  'imgix.token': 'IMGIX_TOKEN',// @see https://www.notion.so/cascade8/Setup-ImgIx-c73142c04f8349b4a6e17e74a9f2209a
  'twilio.account.sid': 'TWILIO_ACCOUNT_SID',
  'twilio.account.secret': 'TWILIO_ACCOUNT_SECRET',
  'twilio.api.key.secret': 'TWILIO_API_KEY_SECRET',
  'twilio.api.key.sid': 'TWILIO_API_KEY_SID',
  'mailchimp.api_key': 'MAILCHIMP_API_KEY',
  'mailchimp.server': 'MAILCHIMP_SERVER',
  'mailchimp.list_id': 'MAILCHIMP_LIST_ID'
}
