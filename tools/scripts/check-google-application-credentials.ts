import { config } from 'dotenv';
import { readdirSync, appendFileSync } from 'fs';
import { resolve, join } from 'path';

config();

const CREDENTIALS_DIR = 'tools/credentials/';
const ENV_FILE = '.env';
const KEY = 'GOOGLE_APPLICATION_CREDENTIALS';

if (process.env[KEY]) {
  // * Exists
  console.log(`Your ${KEY} are successfully set.`);
} else {
  // ! Not found
  // Search folder for JSON file
  const credDir = readdirSync(resolve(process.cwd(), CREDENTIALS_DIR));
  const credFile = credDir.filter(file => file.split('.').pop() === 'json');

  if (credFile.length === 1) {
    // * JSON file detected
    const fileName = credFile.pop();
    const GAP = join(CREDENTIALS_DIR, fileName);
    const line = `${KEY}="${GAP}"`;
    appendFileSync(resolve(process.cwd(), ENV_FILE), line);
    console.log(`Your ${KEY} .env variable been successfully set!`);
  } else {
    // ! unable to detect JSON, either 0 or more than one
    console.warn(
      `Unable to automatically detect service account key - please ensure there is one JSON file in ${CREDENTIALS_DIR}`
    );
  }
}
