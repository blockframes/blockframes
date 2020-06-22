import * as firebaseTools from 'firebase-tools';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

const dotenvResult = dotenv.config();

// const fileExists = (fileName: string) => existsSync(resolve(process.cwd(), fileName))

const SECRETS_FILEPATH = 'secrets.sh';
const SECRETS_TEMPLATE_FILEPATH = 'secrets.template.sh';

const FIREBASE_CONFIG: any = {};

if (!process.env.SENDGRID_API_KEY || !process.env.ETHEREUM_MNEMONIC) {
  // Env probably doesnt exist in env
  loadSecretsFile();
}

setFirebaseConfig();

function loadSecretsFile() {
  let deploySecrets: { [key: string]: string };
  let secretsBuffer: Buffer;
  try {
    secretsBuffer = readFileSync(resolve(process.cwd(), SECRETS_FILEPATH));
  } catch (e) {
    // * secrets file read failed, use template instead
    secretsBuffer = readFileSync(resolve(process.cwd(), SECRETS_TEMPLATE_FILEPATH));
  } finally {
    // * Parse secrets.sh file.
    deploySecrets = parseBashExports(secretsBuffer.toString()); // forEach(char => console.log(char, '\n'));
  }
  // * Write parsed keys to environment for use in other scripts
  Object.keys(deploySecrets).forEach(key => {
    process.env[key] = deploySecrets[key];
  });
}

async function setFirebaseConfig() {
  // * Check if we are in CI
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
  const output = [];
  output.push(`sendgrid.api_key=${process.env?.SENDGRID_API_KEY}`);
  output.push(`relayer.mnemonic=${process.env?.ETHEREUM_MNEMONIC}`);
  output.push(`jwplayer.key=${process.env?.JWPLAYER_KEY}`);
  output.push(`jwplayer.secret=${process.env?.JWPLAYER_SECRET}`);
  output.push(`algolia.api_key=${process.env?.ALGOLIA_API_KEY}`);
  output.push(`admin.password=${process.env?.ADMIN_PASSWORD}`);
  output.push(`admin.email=${process.env?.CASCADE8_ADMIN}`);
  return output;
}

/**
 * Checks for `export`s in a bash script and parses them as strings
 * @param input a string with the contents of the file
 * @returns a map with key-value pairs
 */
function parseBashExports(input: string): { [key: string]: string } {
  const lines = input.split('\n');
  const output = {};
  lines.forEach(line => {
    const words = line.split(/\s/g);
    if (words?.[0] !== 'export') return;
    const assignment = words[1].split('=');
    const key = assignment[0];
    const value = assignment[1].replace(/"|'/g, '');
    output[key] = value;
  });
  return output;
}
