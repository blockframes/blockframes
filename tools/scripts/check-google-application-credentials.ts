import { config } from 'dotenv';
import { readdirSync, appendFileSync } from 'fs';
import { resolve, join } from 'path';

/*
TODO: In next pull request
 * Would be nice to do something generic for each key :
 *
 * const variables = [{
 *   key: 'GOOGLE_APPLICATION_CREDENTIALS',
 *   doc: // link to documentation
 * }, {
 *   key: 'ALGOLIA_API_KEY',
 *   doc: // link to documentation
 * },...];
 * for (const variable of variables) {
 *   if (!process.env[variable.key]) {
 *     console.error(`No ${variable.key} found in ${ENV_FILE}, you can find the documentation here : ${variable.doc}`);
 *   }
 * }
 *
 * AND
 * I'm not sure to understand what you're doing here, looks like you look for json file under 'tools/credentials/' and supposed it's the google credentials. I don't see so much in which case this would happen.
 *
 * Currently everybody have put their credential somewhere in their computer. So for me if we want to force dev to put their credentials in the tools/credentials folders the best is to :
 *
 * if (process.env[KEY]) {
 *   const path = process.env[KEY];
 *   // If there is another path, copy the file & update the .env.
 *   if (path !== `./tools/credentials/google-credential.json`) {
 *     const from = resolve(process.cwd(), path), resolve(process.cwd());
 *     const to = resolve(process.cwd()), `./tools/credentials/google-credential.json`);
 *     copyFile(from, to);
 *     // update the .env file
 *   }
 * } else {
 *   console.error(`No ${KEY} found in ${ENV_FILE}, you can find the documentation here : ${docLink}`);
 * }

*/
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
