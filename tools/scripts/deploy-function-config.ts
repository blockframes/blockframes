import * as requiredVars from './mandatory-env-vars.json';
import * as firebaseTools from 'firebase-tools';
import { loadSecretsFile } from './secrets-lib';

if (!process.env.SENDGRID_API_KEY || !process.env.ALGOLIA_API_KEY) {
  // Env config values probably doesn't exist in env
  loadSecretsFile();
}

setFirebaseConfig();

async function setFirebaseConfig() {
  // * Check if we are in CI
  const FIREBASE_CONFIG: any = {};
  if (process.env.FIREBASE_CI_TOKEN) FIREBASE_CONFIG.token = process.env.FIREBASE_CI_TOKEN;
  process.stdout.write('Existing Firebase Functions Config Values:\n');
  await firebaseTools.functions.config.get(undefined, FIREBASE_CONFIG).then(console.log);
  process.stdout.write('Writing new config...\n');

  const keyVal = getKeyValFormat(); // TODO: This should parse. not hardcoded
  await firebaseTools.functions.config
    .set(keyVal, FIREBASE_CONFIG)
    .then(() => console.log('Config Deployed'));
}

/**
 * This is temporary because key names are hardcoded.
 * Future versions will not hardcode this.
 * But need to figure out how to indicate nested objects (more underscores?)
 */
function getKeyValFormat(): string[] {
  warnMissingVars();
  const output = [];
  output.push(`sendgrid.api_key=${process.env?.SENDGRID_API_KEY}`);
  output.push(`relayer.mnemonic=${process.env?.ETHEREUM_MNEMONIC}`);
  output.push(`jwplayer.key=${process.env?.JWPLAYER_KEY}`);
  output.push(`jwplayer.secret=${process.env?.JWPLAYER_SECRET}`);
  output.push(`algolia.api_key=${process.env?.ALGOLIA_API_KEY}`);
  output.push(`admin.password=${process.env?.ADMIN_PASSWORD}`);
  output.push(`admin.email=${process.env?.CASCADE8_ADMIN}`);
  output.push(`imgix.token=${process.env?.IMGIX_TOKEN}`);
  return output;
}

function warnMissingVars(): void | never {
  function throwMissingVar(name: string) {
    throw new Error(`Please ensure the following variable is set in env: ${name}`);
  }
  const requiredVarsArray = requiredVars.required;
  requiredVarsArray.map(key => process.env?.[key] ?? throwMissingVar(key));
}
