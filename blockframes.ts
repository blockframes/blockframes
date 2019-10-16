#!/usr/bin/env ts-node
const path = require('path');
import { exec } from 'child_process';
import { copyFile, existsSync, readFile, readFileSync } from 'fs';
require('dotenv').config();

//////////////////
// PARSING ARGV //
//////////////////

const type = process.argv[2];
const filename = process.argv[3];

//////////////////////
// PORT BASH SCRIPT //
//////////////////////

const deployDemos = () => {
  exec('set -x && set -e');
  const tag = `demo-${new Date()}`;
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
    // client.scp2('dist/apps/*', `blockframes:~/www/www-data/demo${i}//`);
    i++;
  }
  exec(`git tag ${tag}`);
  exec(`git push origin ${tag}`);
};

const deploySecrets =  () => {
  let secrets, secretsTemplate;
  const tokenArg = '';

  if (existsSync('./secrets.json')) {
    const rawSecret = readFileSync('./secrets.json');
    secrets = JSON.parse(rawSecret.toString());
   
  } else {
    const rawTemplate =  readFileSync('./secrets.template.json');
    secretsTemplate = JSON.parse(rawTemplate.toString());
  }
 
};

/* 

# ci deployement
if [ -n "${FIREBASE_CI_TOKEN}" ]; then
  TOKEN_ARG="--token ${FIREBASE_CI_TOKEN}"
fi

# Check that we have the configuration in memory,
# If we don't, load from the local secrets file.
# This file is for developers' local environment.
if [ -z "${SENDGRID_API_KEY}" ] || [ -z "${ETHEREUM_MNEMONIC}" ]; then
  echo -e "\e[33mno configuration found in your env, loading your secrets\e[0m"

  if [ -f "$SECRETS" ]; then
    source ${SECRETS};
  else
    echo -e "\e[31mno secrets.sh file found, using secrets.template.sh";
    echo -e "(this is not secure, don't use for production!)\e[0m";
    echo -e "\e[31mpress enter to continue the deploy\e[0m";
    read -n 1 -s -r;
    source ${SECRETS_TEMPLATE};
  fi
fi


echo "deploying the functions configuration"
firebase functions:config:set sendgrid.api_key="${SENDGRID_API_KEY}" \
                              relayer.mnemonic="${ETHEREUM_MNEMONIC}" \
                              algolia.api_key="${ALGOLIA_API_KEY}" \
                              admin.email="${CASCADE8_ADMIN}" \
                              ${TOKEN_ARG};
 */

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

  if (type === 'deploy' && filename === 'demos') {
    deployDemos();
  }

  if (type === 'deploy' && filename === 'secrets') {
    deploySecrets();
  }
};

program();
