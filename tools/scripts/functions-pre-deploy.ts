import 'tsconfig-paths/register'
import { runShellCommand } from '@blockframes/firebase-utils';
import { config } from 'dotenv';

config()

async function predeploy() {
  if (!process.env['SKIP_PREDEPLOY_HOOKS']) {
    // * run predeploy hooks
    await runShellCommand('npm run lint:backend-functions');
    await runShellCommand('npm run build:backend-functions');
    await runShellCommand('npm run deploy:functions:config');
  } else {
    console.log('Env variable "SKIP_PREDEPLOY_HOOKS" is set, skipping pre-deploy hooks...');
  }
}

predeploy().then(() => process.exit(0)).catch(() => process.exit(1));
