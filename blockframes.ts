#!/usr/bin/env ts-node
const path = require('path');

//////////////////
// PARSING ARGV //
//////////////////

const type = process.argv[2];
const filename = process.argv[3];


//////////////////////
// PORT BASH SCRIPT //
//////////////////////


const deploy_secrets = () => {
  const SECRETS = path('./secrets.sh');
  const SECRETS_TEMPLATE = path('secrets.template.sh');

  const TOKEN_ARG = ""

}

const deploy_demos = () => {
  // set -x : show the command?
  // set -e : stop script if there is error

}

////////////////////////////////
// PORT PACKAGE.JSON WITH ENG //
////////////////////////////////

const package_env = () => {
  // npx run build:functions --configuration=dev
  // firebase deploy --only functions

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

}

////////////////////////
// FIREBASE PREDEPLOY //
////////////////////////

const firebase_predeploy = () => {

}


/////////////
// PROGRAM //
/////////////


const program = () => {
  if (!type || !filename) {
    console.error('please enter type and name')
  }

  // deploy_secrets.sh
  if (type === "deploy" && filename === "secrets") {
    // deploy_secrets();

    console.log(type, filename)
  }

}

program();
