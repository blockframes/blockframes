#!/usr/bin/env ts-node
const commander = require('commander');
const client = require('scp2');
import { exec, execSync, spawn } from 'child_process';
import { copyFile, existsSync, readFileSync } from 'fs';
require('dotenv').config();

//////////////////
// PARSING ARGV //
//////////////////

commander
  .option('-s, script <command>', 'Launches the following script command')
  .option('-d, deploy <file>', 'Launces the function to deploy the wanted file')
  .option('-t, token <token>', 'Pass a token to the script');

commander.parse(process.argv);

//////////////////////
// PORT BASH SCRIPT //
//////////////////////

const deployDemos = () => {
  // TODO(DAJUNG): check if set -x and set -e works on Windows
  exec('set -x && set -e');
  const tag = `demo-${new Date().toISOString().slice(0, 10)}`;
  process.env['NODE_OPTIONS'] = '--max_old_space_size=8192';
  exec('git checkout demo');
  let i = 0;
  while (i < 5) {
    console.log(i);
    process.env['ENV'] = 'production';
    copyFile(`.env/demo/env.demo${i}.ts`, './env/env.ts', err => {
      console.log(err);
      process.exit(1);
    });
    copyFile(`.env/demo/env.demo${i}.ts`, './env/env.prod.ts', err => {
      console.log(err);
      process.exit(1);
    });
    execSync('blockframes -s build:all');
    execSync(`firebase use demo${i}`);

    execSync('firebase deploy --except functions');

    // we deploy everything but functions, they tend to crash
    let rerunLoop = true;
    while (rerunLoop) {
      exec('firebase deploy --only functions', err => {
        if (err) {
          rerunLoop = true;
        }
        rerunLoop = false;
      });
    }
    // What are the configs for blockframes server?
    client.scp('dist/apps/*', `blockframes:~/www/www-data/demo${i}//`, err => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
    i++;
  }
  execSync(`git tag ${tag}`);
  execSync(`git push origin ${tag}`);
};

const deploySecrets = (firebase_ci_token: string) => {
  let secrets, secretsTemplate;
  let tokenArg: string;

  // ci deployment
  if (firebase_ci_token) {
    tokenArg = `--token ${firebase_ci_token}`;
  }

  // Since there is no source or . operator on Windows,
  // we have to specify in an if statement which is our
  // source
  if (existsSync('./secrets.json')) {
    const rawSecret = readFileSync('./secrets.json');
    secrets = JSON.parse(rawSecret.toString());
    if (secrets.SENDGRID_API_KEY || secrets.ETHEREUM_MNEMONIC) {
      console.log('configuration found in your env, loading your secrets');
      console.log('deploying the functions configuration');
      execSync(`firebase functions:config:set sendgrid.api_key="${secrets.SENDGRID_API_KEY}" \
                                          replayer.mnemonic="${secrets.ETHEREUM_MNEMONIC}" \
                                          algolia.api_key="${secrets.ALGOLIA_API_KEY}" \
                                          admin.email="${secrets.CASCADE8_ADMIN}" \
                                          ${tokenArg}`);
    }
  } else {
    const rawTemplate = readFileSync('./secrets.template.json');
    secretsTemplate = JSON.parse(rawTemplate.toString());
    console.log('deploying the functions configuration');
    execSync(`firebase functions:config:set sendgrid.api_key="${secretsTemplate.SENDGRID_API_KEY}" \
                                        replayer.mnemonic="${secretsTemplate.ETHEREUM_MNEMONIC}" \
                                        algolia.api_key="${secretsTemplate.ALGOLIA_API_KEY}" \
                                        admin.email="${secretsTemplate.CASCADE8_ADMIN}" \
                                        ${tokenArg}`);
  }
};

////////////////////////////////
// PORT PACKAGE.JSON WITH ENV //
////////////////////////////////

const packageEnv = (command: string) => {
  switch (command) {
    case 'start':
      const npx = spawn('/home/max/.nvm/versions/node/v10.16.1/bin/npx ng serve --hmr --disable-host-check');
      npx.stdout.on('data', stdout => {
        console.log(stdout.toString());
      });
  }
  // cross-env NODE_ENV=production ???
  // "build:main": "npx ng build main --base-href / --configuration=\"${ENV:-dev}\"",
  // "build:delivery": "npx ng build delivery --base-href /delivery/ --configuration=\"${ENV:-dev}\"",
  // "build:movie-financing": "npx ng build movie-financing --base-href /movie-financing/ --configuration=\"${ENV:-dev}\"",
  // "build:catalog-marketplace": "npx ng build catalog-marketplace --base-href /catalog-marketplace/ --configuration=\"${ENV:-dev}\"",
  // "build:catalog-dashboard": "npx ng build catalog-dashboard --base-href /catalog-dashboard/ --configuration=\"${ENV:-dev}\"",
  // "build:functions": "npx ng build backend-functions --configuration=\"${ENV:-dev}\"",
  // "pree2e": "ng build backend-ops --configuration=\"${ENV}\" && node dist/apps/backend-ops/main.js",
  // "e2e:main": "./node_modules/.bin/ng e2e main-e2e --configuration=\"${ENV}\" --headless",
  // "e2e:delivery": "./node_modules/.bin/ng e2e delivery-e2e --configuration=\"${ENV}\" --headless",
  // "e2e:catalog-marketplace": "./node_modules/.bin/ng e2e catalog-marketplace-e2e --configuration=\"${ENV}\" --headless",
  // "e2e:movie-financing": "./node_modules/.bin/ng e2e movie-financing-e2e --configuration=\"${ENV}\" --headless",
  // in angular.json
  // architect -> build -> configurations: { "dev": {} } ???
};

////////////////////////
// FIREBASE PREDEPLOY //
////////////////////////

const firebasePredeploy = () => {};

/////////////
// PROGRAM //
/////////////

const program = () => {
  if (commander.script) {
    packageEnv(commander.script);
  } else if (commander.deploy === 'demo') {
    deployDemos();
  } else if (commander.deploy === 'secrets') {
    deploySecrets(commander.token);
  } else {
    console.log(commander.opts());
  }
};

program();
