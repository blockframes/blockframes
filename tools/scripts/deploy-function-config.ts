import 'tsconfig-paths/register';
import { config } from 'dotenv';
config();

import * as firebaseTools from 'firebase-tools';
import { loadSecretsFile, absSecretPath, absTemplatePath } from './lib';
import { warnMissingVars } from '@blockframes/firebase-utils';
import { existsSync } from 'fs';
import { execSync } from 'child_process'
import camelcase from 'camelcase'
import { functionsConfigMap } from '@blockframes/firebase-utils/firestore/emulator';

const args = process.argv.slice(2);
const [arg] = args;

if (arg) console.log('The following args were detected:', args)


/**
 * This is temporary because key names are hardcoded.
 * Future versions will not hardcode this.
 * But need to figure out how to indicate nested objects (more underscores?)
 */
function getKeyValFormat(env?: string): string[] {
  const formatEnvKey = (key: string) => `${env ? camelcase(env) : ''}_${key}`
  /**
   * This nested function will check to see if a key exists in process.env when prefixed
   * with a particular env name & default to base key if not set
   * @param key environment variable keyname
   */
  function getKeyName(key: string) {
    if (env && process.env.hasOwnProperty(formatEnvKey(key))) {
      return formatEnvKey(key);
    }
    return key;
  }

  /**
   * This generates the statement line used to set function config values in Firebase Functions
   */
  function getSettingStatement([fieldPath, envKey]) {
    return `${fieldPath}="${process.env[getKeyName(envKey)]}"`
  }

  return Object.entries(functionsConfigMap).map(getSettingStatement)
}

async function setFirebaseConfig() {
  if (existsSync(absSecretPath) || existsSync(absTemplatePath)) {
    console.warn('ERROR: To prevent this error message coming up, migrate your secrets.sh file to .env');
    console.warn('Please run "npm run migrate:deploy-secrets".');
    console.warn('After migration, please delete your secrets.sh & secrets.template.sh');
    loadSecretsFile();
  }
  warnMissingVars();

  // * Check if we are in CI
  const FIREBASE_CONFIG: firebaseTools.FirebaseConfig = {};
  if (process.env.FIREBASE_CI_TOKEN) FIREBASE_CONFIG.token = process.env.FIREBASE_CI_TOKEN;
  if (arg) FIREBASE_CONFIG.project = arg;

  const keyVal = getKeyValFormat(arg); // TODO(#3620) Parse .env rather than read hardcoded values

  const cmd = `firebase --project=${arg ? arg : ''} functions:config:set ${keyVal.join(' ')}`;
  process.stdout.write(execSync(cmd));

  console.log('Config Deployed!');
}

setFirebaseConfig()
  .then(() => process.exit(0))
  .catch(console.error); // This means if there is an error, the deploy process will continue
