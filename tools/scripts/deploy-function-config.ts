import 'tsconfig-paths/register';
import { config } from 'dotenv';
config();

import * as firebaseTools from 'firebase-tools';
import { loadSecretsFile, absSecretPath, absTemplatePath } from './lib';
import { warnMissingVars } from '@blockframes/firebase-utils';
import { existsSync } from 'fs';
import { execSync } from 'child_process'
import camelcase from 'camelcase'

const args = process.argv.slice(2);
const [arg] = args;

if (arg) console.log('The following args were detected:', args)

/**
 * This tuple array maps field names to the environment variable key to set them to
 */
const functionsConfigMap: Record<string, string> = {
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
