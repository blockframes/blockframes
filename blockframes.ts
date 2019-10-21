#!/usr/bin/env ts-node
const commander = require('commander');
const client = require('scp2');
import { exec, execSync, spawn, ChildProcess, spawnSync } from 'child_process';
import { copyFile, existsSync, readFileSync } from 'fs';
require('dotenv').config();

//////////////////
// PARSING ARGV //
//////////////////

commander
  .option('-s, script <command>', 'Launches the following script command')
  .option('-d, deploy <file>', 'Launces the function to deploy the wanted file')
  .option('-t, token <token>', 'Pass a token to the script')
  .option('-c, --config <command>', 'Defines the config for the function');

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
    // What are the configs for blockframes server? @laurent
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

const deploySecrets = (firebase_ci_token?: string) => {
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

const deployProduction = () => {
  exec('set -x && set -e');

  copyFile('./env/env.prod.ts', './env/env.ts', err => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
  });

  const build = spawnSync('npm run build:all');

  execSync('firebase use prod');

  // old command was ./secrets.sh blockframes , not sure where to put blockframes
  this.deploySecrets('blockframes');

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
};

////////////////////////////////
// PORT PACKAGE.JSON WITH ENV //
////////////////////////////////

// TODO: Some of the build commands don't console.log their
// progress. We need to find out why? start script works
const packageEnv = (command: string, config?: string) => {
  let configENV = 'dev';
  if (config) {
    configENV = config;
  }
  switch (command) {
    case 'start':
      const npx: ChildProcess = process.platform==='win32'
      ? exec('npx ng serve --hmr --disable-host-check')
      : spawn('npx', ['ng', 'serve', '--hmr', '--disable-host-check'], {stdio: 'inherit'});
      npx.stdout.on('data', stdout => {
        console.log(stdout.toString());
      });
      break;
    case 'build:main':
      console.log(`excuting in '${configENV}' environment`);
      const buildMain: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build main --base-href --configuration=${configENV}`)
      : spawn('npx', ['ng','build','main','--base-href',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildMain.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'build:delivery':
      console.log(`excuting in '${configENV}' environment`);
      const buildDelivery: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build delivery --base-href delivery --configuration=${configENV}`)
      : spawn('npx', ['ng','build','delivery','--base-href','delivery',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildDelivery.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      buildDelivery.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      buildDelivery.on('message', x => {
        console.log(x);
      });
      break;
    case 'build:movie-financing':
      console.log(`excuting in '${configENV}' environment`);
      const buildFinancing: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build movie-financing --base-href movie-financing --configuration=${configENV}`)
      : spawn('npx', ['ng','build','movie-financing','--base-href','movie-financing',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildFinancing.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      buildFinancing.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'build:catalog-marketplace':
      console.log(`excuting in '${configENV}' environment`);
      const buildMarketplace: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build catalog-marketplace --base-href marketplace --configuration=${configENV}`)
      : spawn('npx', ['ng','build','catalog-marketplace','--base-href','marketplace',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildMarketplace.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      buildMarketplace.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'build:catalog-dashboard':
      console.log(`excuting in '${configENV}' environment`);
      const buildDashboard: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build catalog-dashboard --base-href catalog-dashboard --configuration=${configENV}`)
      : spawn('npx', ['ng','build','catalog-dashboard','--base-href','catalog-dashboard',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildDashboard.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      buildDashboard.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'build:functions':
      console.log(`excuting in '${configENV}' environment`);
      const buildFunctions: ChildProcess = process.platform==='win32'
      ? exec(`npx ng build backend-functions --configuration=${configENV}`)
      : spawn('npx', ['ng','build','backend-functions',`--configuration=${configENV}`], {stdio: 'inherit'});
      buildFunctions.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      buildFunctions.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
      case 'pree2e':
        console.log(`excuting in '${configENV}' environment`);
        console.log(`ng build backend-ops --configuration=${configENV} is in progress...`);
        // since the original command used the && operator, we need to split it up into two commands.
        // Therefore we have to use the spawnSync and execSync command,
        // so that we wait for each command to finish
        const preE2E = process.platform === 'win32'
        ? exec(`ng build backend-ops --configuration=${configENV}`)
        : spawn('ng', ['build', 'backend-ops', `--configuration=${configENV}`]);
        preE2E.stdout.on('data', data => console.log(data.toString()));
        preE2E.stdout.on('close', () => exec('node dist/apps/backend-ops/main.js'));
        break;
    case 'e2e:main':
      console.log(`excuting in '${configENV}' environment`);
      const e2eMain: ChildProcess = process.platform==='win32'
      ? exec(`npx ng e2e main-e2e --configuration=${configENV} --headless`)
      : spawn('npx', ['ng','e2e','main-e2e',`--configuration=${configENV}`,'--headless'], {stdio: 'inherit'});
      e2eMain.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      e2eMain.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'e2e:delivery':
      console.log(`excuting in '${configENV}' environment`);
      const e2eDelivery: ChildProcess = process.platform==='win32'
      ? exec(`npx ng e2e delivery-e2e --configuration=${configENV} --headless`)
      : spawn('npx', ['ng','e2e','delivery-e2e',`--configuration=${configENV}`,'--headless'], {stdio: 'inherit'});
      e2eDelivery.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      e2eDelivery.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'e2e:marketplace':
      console.log(`excuting in '${configENV}' environment`);
      const e2eMarketplace: ChildProcess = process.platform==='win32'
      ? exec(`npx ng e2e catalog-marketplace-e2e --configuration=${configENV} --headless`)
      : spawn('npx', ['ng','e2e','marketplace-e2e',`--configuration=${configENV}`,'--headless']);
      e2eMarketplace.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      e2eMarketplace.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
    case 'e2e:movie-financing':
      console.log(`excuting in '${configENV}' environment`);
      const e2eFinancing: ChildProcess = process.platform==='win32'
      ? exec(`npx ng e2e movie-financing-e2e --configuration=${configENV} --headless`)
      : spawn('npx', ['ng','e2e','movie-financing-e2e',`--configuration=${configENV}`,'--headless']);
      e2eFinancing.stderr.on('data', stderr => {
        console.log(stderr.toString());
      });
      e2eFinancing.stdout.on('data', stdou => {
        console.log(stdou.toString());
      });
      break;
  }
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
    if (commander.config === 'production' || commander.config === 'config') {
      packageEnv(commander.script, commander.config);
    } else {
      packageEnv(commander.script);
    }
  } else if (commander.deploy === 'demo') {
    deployDemos();
  } else if (commander.deploy === 'secrets') {
    deploySecrets(commander.token);
  } else if (commander.deploy === 'production') {
    deployProduction();
  } else {
    console.log(commander.opts());
  }
};

program();
