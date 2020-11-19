import { join, resolve } from 'path';
import { copyFileSync } from 'fs';
import { runShellCommand, getServiceAccountObj } from '@blockframes/firebase-utils';
import { promises } from 'fs';

const { readdir, readFile, writeFile } = promises;

async function getSAK(projectId: string) {
  console.log('Attempting to find and set correct service account key.');
  let key: any;
  try {
    key = getServiceAccountObj(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } catch (e) {}

  if (key.project_id === projectId) {
    console.log('Correct service account key already set!');
    return;
  }

  const credFolder = resolve(process.cwd(), 'tools', 'credentials');
  const credFileNames = await readdir(credFolder);
  const jsonFiles = credFileNames.filter((fileName) => fileName.split('.').pop() === 'json');
  // tslint:disable-next-line: no-eval
  const SAKS = jsonFiles.map((fileName) => ({ fileName, key: eval('require')(resolve(process.cwd(), 'tools', 'credentials', fileName)), }));
  const SAK = SAKS.find((account) => account.key.project_id === projectId);
  if (!SAK) {
    console.warn('WARNING: Service account key may not exist or have correct permissions! Run health check to confirm...');
    return;
  }

  const dotenvFile = await readFile(resolve(process.cwd(), '.env'), 'utf-8').catch(() => {
    console.warn('Generating .env file - NOT FOUND');
    return '';
  });
  const dotenvLines = dotenvFile.split('\n');
  let GACLineFound = false;
  const GACLine = `GOOGLE_APPLICATION_CREDENTIALS="${join('tools', 'credentials', SAK.fileName)}"`;
  function processEnvLine(line: string) {
    const envKey = line.split('=').shift();
    if (envKey === 'GOOGLE_APPLICATION_CREDENTIALS') {
      GACLineFound = true;
      return GACLine;
    } else return line;
  }
  const updatedEnvFile = dotenvLines.map(processEnvLine);
  if (!GACLineFound) updatedEnvFile.push('\n', GACLine, '\n');
  await writeFile(resolve(process.cwd(), '.env'), updatedEnvFile.join('\n'));
}

export async function selectEnvironment(projectId: string) {
  await getSAK(projectId);
  await runShellCommand(`firebase use ${projectId}`);
  await runShellCommand(`gcloud config set pass_credentials_to_gsutil true`);
  await runShellCommand(`gcloud auth activate-service-account --key-file=${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  await runShellCommand(`gcloud config set project ${projectId}`);
  console.log('Firebase project selected for firebase, gcloud & gsutil...');
  const localEnvFile = resolve(process.cwd(), 'env', 'env.ts');
  const targetEnvFile = resolve(process.cwd(), 'env', `env.${projectId}.ts`);
  copyFileSync(targetEnvFile, localEnvFile);
  console.log(`env.ts file overwritten with env.${projectId}.ts`);
}
