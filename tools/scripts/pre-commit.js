const fs = require('fs');
const dotenv = require('dotenv');
const forbiddenEntries = dotenv.parse(fs.readFileSync('.env'));
const childProcess = require('child_process');
const forbiddenKeys = Object.keys(forbiddenEntries);
const cmd = 'git commit -v --dry-run';
const output = childProcess.execSync(cmd).toString();

const skipChecksFor = [
  'PROJECT_ID', // Common string
  'ALGOLIA_APP_ID' // Not a secret, exists in blockframes-xxx.env.ts
];

let errors = false;
for (const key of forbiddenKeys) {
  const value = forbiddenEntries[key];
  if (!skipChecksFor.includes(key) && !!value && output.includes(value)) {
    console.log(`You are about to commit a file with content of env var ${key} !`);
    errors = true;
  }
}

if (errors) {
  console.log('Your commit contains forbidden entries, please update your files before trying again.');
  process.exit(1);
} else {
  process.exit(0);
}
