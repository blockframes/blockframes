import { execSync } from 'child_process';
import { config } from 'dotenv';

config()

function execLog(cmd: string) {
  const output = execSync(cmd);
  process.stdout.write(output);
}

if (!process.env['SKIP_PREDEPLOY_HOOKS']) {
  // * run predeploy hooks
  execLog('npm run lint backend-functions');
  execLog('npm run build:backend-functions');
  execLog('npm run deploy:functions:config');
} else {
  console.log('Env variable "SKIP_PREDEPLOY_HOOKS" is set, skipping pre-deploy hooks...');
}
