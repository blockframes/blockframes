// TODO: remove secrets.sh from gitignore in next release, maybe remove from postinstall
import { loadSecretsFile } from './lib';
import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');

console.log('This script will generate a .env file from your secrets.sh if no .env file exists.\n');

if (existsSync(envPath)) {
  console.log('Looks like you have already set up your .env file! Aborting migration...');
} else {
  console.log('No .env file detected, running migration...');
  const parsedSecrets = loadSecretsFile();
  // const envArray = Object.keys(parsedSecrets).map(key => {
  //   return `${key}="${parsedSecrets[key]}"`;
  // });
  const envArray = Object.entries(parsedSecrets).map(([key, value]) => `${key}="${value}"`);

  writeFileSync(envPath, envArray.join('\n'));
  console.log(
    'Migration Complete!\n\nPlease delete your secrets.sh and secrets.template.sh after checking .env file is correct.'
  );
}
