#!/usr/bin/env ts-node
const path = require('path');
import { exec } from 'child_process';
import { copyFile } from 'fs';
const client = require('scp2');
require('dotenv').config();

//////////////////
// PARSING ARGV //
//////////////////

const type = process.argv[2];
const filename = process.argv[3];

//////////////////////
// PORT BASH SCRIPT //
//////////////////////

const deployDemoSecrets = () => {
  const TAG = `demo-${new Date()}`;
  exec('set -x && set -e');
  process.env['NODE_OPTIONS'] = '--max_old_space_size=8192';
  exec('git checkout demo');
  let i = 0;
  while (i < 5) {
    console.log(i);
    process.env['ENV'] = 'production';
    copyFile(`.env/demo/env.demo${i}.ts`, './env/env.ts', err => {
      console.log(err);
    });
    copyFile(`.env/demo/env.demo${i}.ts`, './env/env.prod.ts', err => {
      console.log(err);
    });
    exec('npm run build:all');
    exec(`firebase use demo${i}`);

    // we deploy everything but functions, they tend to crash
    exec('firebase deploy --except functions', err => {
      let countRetry = 0;
      if (err && countRetry < 10) {
        console.log(`Error occured, retry! ${err}`);
        countRetry++;
        exec('firebase deploy --except functions');
      } else if (countRetry >= 10) {
        console.log('number of retries exceeded');
      }
    });
    // do {exec('firebase deplay --only functions')} while(true);
    client.scp2('dist/apps/*', `blockframes:~/www/www-data/demo${i}//`);
    i++;
  }
  exec(`git tag ${TAG}`);
  exec(`git push origin ${TAG}`);
};

const deployDemos = () => {
  // set -x : print commands and their arguments as they are executed.
  // set -e : stop script if there is error

  // export NODE_OPTIONS="--max_old_space_size=8192" : Increasing Node’s Memory

  // git checkout demo : exec('git checkout demo')
  exec('npm --version', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  // TAG="demo-$(date +'%Y%m%d%H%M')"
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  const tag = `demo-${year}-${month}-${day}`;
  console.log(tag);

  // for loop : copy env files -> build => firebase deploy without function -> only function
  // for (let i = 1; i < 6; i++) {
  // console.log(i);

  // export ENV=production
  process.env['NODE_ENV'] = 'production';
  console.log(process.env.NODE_ENV);

  // cp ./env/demo/env.demo${i}.ts ./env/env.ts : copyFile()
  // destination.txt will be created or overwritten by default.
  copyFile('source.txt', 'destination.txt', err => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });

  // }
};

////////////////////////////////
// PORT PACKAGE.JSON WITH ENG //
////////////////////////////////

const packageEnv = () => {
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
  if (!type || !filename) {
    console.error('please enter type and name');
  }

  // deploy_secrets.sh
  if (type === 'deploy' && filename === 'demo') {
    // deploy_secrets();
    deployDemos();
    console.log(type, filename);
  }

  if (type === 'secrets' && filename === 'demo') {
    deployDemoSecrets();
  }
};

program();
