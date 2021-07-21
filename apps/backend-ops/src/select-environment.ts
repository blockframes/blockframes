import { join, resolve } from 'path';
import { copyFileSync } from 'fs';
import { runShellCommand, getServiceAccountObj } from '@blockframes/firebase-utils';
import { promises as fsPromises } from 'fs';
import { execSync } from 'child_process';
import camelcase from 'camelcase';

const { readdir, readFile, writeFile } = fsPromises;

const SAKDirPath = join('tools', 'credentials');

const SAKKeyName = 'GOOGLE_APPLICATION_CREDENTIALS';

/**
 * Will return true if SAK project corresponds to given project.
 */
function SAKIsCorrect(projectId: string) {
  let key;
  try {
    key = getServiceAccountObj(process.env[SAKKeyName]);
    console.log('Current SAK projectId:', key.project_id);
  } catch (e) { void 0; }
  return projectId === key.project_id;
}

function isJSON(input: string) {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

/**
 * This function will find the correct SAK and set `GOOGLE_APPLICATION_CREDENTIALS` to
 * point to it.
 * @param projectId project ID to find and update SAK path in dotenv
 */
async function updateSAKPathInDotenv(projectId: string) {
  console.log('Attempting to find and set correct service account key.');

  const GAPKey = `GAP_${camelcase(projectId)}`;
  if (GAPKey in process.env) {
    console.log(`GAP key found in env: ${GAPKey}`);
    if (isJSON(process.env[GAPKey])) {
      // * Is an object, write to disk
      await writeFile(resolve(SAKDirPath, 'creds.json'), process.env[GAPKey], 'utf-8');
      return updateDotenv(SAKKeyName, join(process.cwd(), SAKDirPath, 'creds.json'));
    } else return updateDotenv(SAKKeyName, process.env[GAPKey]); // * Is a path
  }

  if (SAKIsCorrect(projectId)) {
    console.log('Correct service account key already set!');
    return;
  }

  const SAKFilename = await findSAKFilename(SAKDirPath, projectId);

  if (SAKFilename) {
    const SAKPath = join(process.cwd(), SAKDirPath, SAKFilename);
    return updateDotenv(SAKKeyName, SAKPath);
  } else {
    console.warn('WARNING: Service account key may not exist or have correct permissions! Run health check to confirm...');
  }

}

/**
 * This function will find the SAK file for a given project ID in
 * specified directory.
 * @param dirPath directory of credential files to search
 * @param projectId the project ID for which to find corresponding SAK for
 */
async function findSAKFilename(dirPath: string, projectId: string) {
  const credFileNames = await readdir(resolve(dirPath));
  const jsonFiles = credFileNames.filter((fileName) => fileName.split('.').pop() === 'json');
  // tslint:disable-next-line: no-eval
  const SAKS = jsonFiles.map((fileName) => ({ fileName, key: eval('require')(resolve(dirPath, fileName)), }));
  return SAKS.find((account) => account.key.project_id === projectId)?.fileName;
}

export async function selectEnvironment(projectId: string) {
  if (!projectId) throw Error('Please specify a project ID!');
  console.log('Selecting project ID:', projectId);

  await updateDotenv('PROJECT_ID', projectId);

  await updateSAKPathInDotenv(projectId);

  let cmd: string;
  let output: string;

  cmd = `firebase use ${projectId}`;
  console.log('Run:', cmd);
  await runShellCommand(cmd);

  cmd = `gcloud config set pass_credentials_to_gsutil true`;
  console.log('Run:', cmd);
  await runShellCommand(cmd);

  cmd = `gcloud auth activate-service-account --key-file=${process.env[SAKKeyName]}`;
  console.log('Run:', cmd);
  output = execSync(cmd).toString();
  console.log(output);

  cmd = `gcloud --quiet config set project ${projectId}`;
  console.log('Run:', cmd);
  output = execSync(cmd).toString();
  console.log(output);

  const localEnvFile = join(process.cwd(), 'env', 'env.ts');
  const targetEnvFile = join(process.cwd(), 'env', `env.${projectId}.ts`);
  copyFileSync(targetEnvFile, localEnvFile);
  console.log(`env.ts file overwritten with env.${projectId}.ts`);
}

/**
 * Update dotenv file with given key-value pair
 * Will append value if not already present
 * @param key key name to update
 * @param value value to place for keyname
 */
async function updateDotenv(key: string, value: string) {
  const file = await readFile(join(process.cwd(), '.env'), 'utf-8').catch(() => {
    console.warn('Generating .env file - NOT FOUND');
    return '';
  });
  const dotenvLines = file.split('\n');
  let lineFound = false;
  const updateLine = `${key}="${value}"`;
  function processEnvLine(line: string) {
    const envKey = line.split('=').shift();
    if (envKey === key) {
      lineFound = true;
      return updateLine;
    } else return line;
  }
  const updatedEnvFile = dotenvLines.map(processEnvLine);
  if (!lineFound) updatedEnvFile.push('\n', updateLine, '\n');
  process.env[key] = value;
  await writeFile(join(process.cwd(), '.env'), updatedEnvFile.join('\n'));
  console.log('./.env - successfully updated with:', updateLine);
}
