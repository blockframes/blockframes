import 'tsconfig-paths/register';
import { config } from 'dotenv';
config();

import * as firebaseTools from 'firebase-tools';
import { loadSecretsFile, absSecretPath, absTemplatePath } from './lib';
import { warnMissingVars } from '@blockframes/firebase-utils';
import { existsSync } from 'fs';
import { execSync } from 'child_process'

/**
 * This is temporary because key names are hardcoded.
 * Future versions will not hardcode this.
 * But need to figure out how to indicate nested objects (more underscores?)
 */
function getKeyValFormat(): string[] {
  const output = [];
  output.push(`sendgrid.api_key="${process.env?.SENDGRID_API_KEY}"`);
  output.push(`relayer.mnemonic="${process.env?.ETHEREUM_MNEMONIC}"`);
  output.push(`jwplayer.key="${process.env?.JWPLAYER_KEY}"`);
  output.push(`jwplayer.secret="${process.env?.JWPLAYER_SECRET}"`);
  output.push(`algolia.api_key="${process.env?.ALGOLIA_API_KEY}"`);
  output.push(`admin.password="${process.env?.ADMIN_PASSWORD}"`);
  output.push(`admin.email="${process.env?.CASCADE8_ADMIN}"`);
  output.push(`imgix.token=${process.env?.IMGIX_TOKEN}`);
  output.push(`twilio.sid=${process.env?.TWILIO_SID}`);
  output.push(`twilio.secret=${process.env?.TWILIO_SECRET}`);
  output.push(`twilio.token=${process.env?.TWILIO_TOKEN}`);
  return output;
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

  console.log('Getting existing Firebase Functions Config Values...\n');
  await firebaseTools.functions.config.get(undefined, FIREBASE_CONFIG).then(console.log);

  const keyVal = getKeyValFormat(); // TODO(#3620) Parse .env rather than read hardcoded values

  console.log('Writing new config...\n');
  const cmd = `firebase functions:config:set ${keyVal.join(' ')}`;
  process.stdout.write(execSync(cmd));
  // await firebaseTools.functions.config.set(keyVal, FIREBASE_CONFIG);
  console.log('Config Deployed!');
}

setFirebaseConfig()
  .then(() => process.exit(0))
  .catch(console.error); // This means if there is an error, the deploy process will continue
