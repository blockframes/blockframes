#!/usr/bin/env ts-node
const path = require('path');
const client = require('scp2');
import { exec } from 'child_process';
import { copyFile, existsSync, readFileSync } from 'fs';
require('dotenv').config();

//////////////////
// PARSING ARGV //
//////////////////

const type = process.argv[2];
const filename = process.argv[3];
const firebase_ci_token = process.argv[4];

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
      if (err) {
        console.log(`Error occured, retry! ${err}`);
        exec('firebase deploy --except functions');
      }
    });
    client.scp('dist/apps/*', `blockframes:~/www/www-data/demo${i}//`, err => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
    });
    i++;
  }
  exec(`git tag ${tag}`);
  exec(`git push origin ${tag}`);
};

const deploySecrets = () => {
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
      exec(`firebase functions:config:set sendgrid.api_key="${secrets.SENDGRID_API_KEY}" \
                                          replayer.mnemonic="${secrets.ETHEREUM_MNEMONIC}" \
                                          algolia.api_key="${secrets.ALGOLIA_API_KEY}" \
                                          admin.email="${secrets.CASCADE8_ADMIN}" \
                                          ${tokenArg}`);
    }
  } else {
    const rawTemplate = readFileSync('./secrets.template.json');
    secretsTemplate = JSON.parse(rawTemplate.toString());
    console.log('deploying the functions configuration');
    exec(`firebase functions:config:set sendgrid.api_key="${secretsTemplate.SENDGRID_API_KEY}" \
                                        replayer.mnemonic="${secretsTemplate.ETHEREUM_MNEMONIC}" \
                                        algolia.api_key="${secretsTemplate.ALGOLIA_API_KEY}" \
                                        admin.email="${secretsTemplate.CASCADE8_ADMIN}" \
                                        ${tokenArg}`);
  }

  /*  
  Check that we have the configuration in memory,
  If we don't, load from the local secrets file.
  This file is for developers' local environment. 
  */
};

/* 


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
