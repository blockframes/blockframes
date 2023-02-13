import { join, resolve } from 'path';
import { getServiceAccountObj, SAK_KEY, SAK_VALUE } from '@blockframes/firebase-utils';
import { promises } from 'fs';
import { execSync } from 'child_process';
import camelcase from 'camelcase';
import { runShellCommand } from './firebase-utils';

/**
 * Will return true if SAK project corresponds to given project.
 */
function SAKIsCorrect(projectId: string) {
  let key;
  try {
    key = getServiceAccountObj(SAK_VALUE());
    console.log('Current SAK projectId:', key.project_id);
  } catch (e) {
    console.log('Was unable to detect previously set SAK');
    return false;
  }
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
 * This function will find the correct SAK and set `GOOGLE_APPLICATION_CREDENTIALS` in .env to
 * point to it as a path.
 * @param projectId project ID to find and update SAK path in dotenv
 */
async function updateSAKPathInDotenv(projectId: string) {
  console.log('Attempting to find and set correct service account key.');

  // Solution 1 : GAP_projectId (example: GAP_blockframes) env var is set (path or JSON), 
  // set `GOOGLE_APPLICATION_CREDENTIALS` in .env as a path.
  const SAKDirPath = join('tools', 'credentials');
  const GAPKey = `GAP_${camelcase(projectId)}`;
  if (GAPKey in process.env) {
    console.log(`GAP key found in env: ${GAPKey}`);
    if (isJSON(process.env[GAPKey])) {
      // * Is an object, write to disk
      await promises.writeFile(resolve(SAKDirPath, 'creds.json'), process.env[GAPKey], 'utf-8');
      return updateDotenv(SAK_KEY, join(process.cwd(), SAKDirPath, 'creds.json'));
    } else return updateDotenv(SAK_KEY, process.env[GAPKey]); // * Is a path
  }

  // Solution 2 : GOOGLE_APPLICATION_CREDENTIALS corresponding to current projectId was already set previously (path or JSON),
  // This does not update .env file.
  // WARNING: if SAK_VALUE() is a JSON, setGcloudProject will fail as it expects SAK_VALUE() to be a file path pointing to a JSON document
  if (SAKIsCorrect(projectId)) {
    console.log('Correct service account key already set!');
    return;
  }

  // Solution 3 : Try to find correct json file in tools/credentials folder
  // set `GOOGLE_APPLICATION_CREDENTIALS` in .env as a path.
  const SAKFilename = await findSAKFilename(SAKDirPath, projectId);
  if (SAKFilename) {
    const SAKPath = join(process.cwd(), SAKDirPath, SAKFilename);
    return updateDotenv(SAK_KEY, SAKPath);
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
  const credFileNames = await promises.readdir(resolve(dirPath));
  const jsonFiles = credFileNames.filter((fileName) => fileName.split('.').pop() === 'json');
  // tslint:disable-next-line: no-eval
  const SAKS = jsonFiles.map((fileName) => ({ fileName, key: eval('require')(resolve(dirPath, fileName)) }));
  return SAKS.find((account) => account.key.project_id === projectId)?.fileName;
}

export async function selectEnvironment(projectId: string) {
  if (!projectId) throw Error('Please specify a project ID!');

  let cmd: string;
  let output: string;
  const isDemo = projectId.startsWith('demo-');

  console.log('Selecting project ID:', projectId);

  if (isDemo) console.log('DETECTED DEMO PROJECT NAME!');

  await updateDotenv('PROJECT_ID', projectId);

  if (!isDemo) {
    await updateSAKPathInDotenv(projectId);
    await setFirebaseToolsProject();
    await setGcloudProject();
  } else {
    updateDotenv(SAK_KEY, '');
  }

  await updateEnvTsFile();

  async function updateEnvTsFile() {
    const fileName = `env.${projectId}`;
    const envLine = `export * from 'env/${fileName}'`;
    const localEnvFile = join(process.cwd(), 'env', 'env.ts');
    await promises.writeFile(localEnvFile, envLine);
    console.log(`env.ts file now contains: ${envLine}`);
  }

  async function setGcloudProject() {
    cmd = 'gcloud config set pass_credentials_to_gsutil true';
    console.log('Run:', cmd);
    await runShellCommand(cmd);

    cmd = `gcloud auth activate-service-account --key-file=${SAK_VALUE()}`;
    console.log('Run:', cmd);
    output = execSync(cmd).toString();
    console.log(output);

    cmd = `gcloud --quiet config set project ${projectId}`;
    console.log('Run:', cmd);
    output = execSync(cmd).toString();
    console.log(output);
  }

  function setFirebaseToolsProject() {
    cmd = `firebase use ${projectId}`;
    console.log('Run:', cmd);
    return runShellCommand(cmd);
  }
}

/**
 * Update dotenv file with given key-value pair
 * Will append value if not already present
 * @param key key name to update
 * @param value value to place for keyname
 */
async function updateDotenv(key: string, value: string) {
  const file = await promises.readFile(join(process.cwd(), '.env'), 'utf-8').catch(() => {
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
  await promises.writeFile(join(process.cwd(), '.env'), updatedEnvFile.join('\n'));
  console.log('./.env - successfully updated with:', updateLine);
}
