import { execSync } from 'child_process';

function logBuffer(b: Buffer) {
  process.stdout.write(b);
}

if (!process.env['IS_NX']) {
  // * run predeploy hooks
  let output: Buffer;
  output = execSync('npm run lint backend-functions');
  logBuffer(output);
  output = execSync('npm run build:backend-functions');
  logBuffer(output);
  output = execSync('npm run deploy:functions:config');
  logBuffer(output);
} else {
  console.log('Env variable "IS_NX" is set, skipping pre-deploy hooks...');
}
