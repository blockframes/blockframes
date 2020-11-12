import { resolve } from 'path';
import { copyFileSync } from 'fs';
import { runShellCommand } from '@blockframes/firebase-utils';

export async function selectEnvironment(projectId: string) {
  await runShellCommand(`firebase use ${projectId}`);
  console.log('Firebase project selected...')
  const localEnvFile = resolve(process.cwd(), 'env', 'env.ts');
  const targetEnvFile = resolve(process.cwd(), 'env', `env.${projectId}.ts`);
  copyFileSync(targetEnvFile, localEnvFile);
  console.log(`env.ts file overwritten with env.${projectId}.ts`)
}
