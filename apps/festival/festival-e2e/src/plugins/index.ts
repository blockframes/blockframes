﻿import 'tsconfig-paths/register';
import { testingCypress } from '@blockframes/testing/cypress/node';
import { install } from 'cypress-log-to-output';

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
export default (async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  console.log('Node version:', process.version);
  console.log('Config: ', config);

  // works by calling : npx cross-env nx e2e festival-e2e --configuration=emulator-incognito
  // see angular.json at the root of the project
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'electron' && config.env.incognito) {
      launchOptions.args.push('--incognito');
    }
    return launchOptions;
  });

  on('task', testingCypress(config));

  install(on);

  // * Returning config here (or promise) changes config.
}) as Cypress.PluginConfig;

// const fs = require('fs');
// const PDFDocument = require('pdfkit');

// const createFakeScript = (title) => {
//   const path = `test-${title}.pdf`;
//   const doc = new PDFDocument();

//   const stream = doc.pipe(fs.createWriteStream(path));
//   doc.fontSize(25)
//     .text(title, 100, 100);
//   doc.end();

//   return new Promise((resolve) => {
//     stream.on('finish', () => {
//       resolve(path);
//     });
//   });
// };

// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config

//   on('task', {
//     'random:pdf': createFakeScript
//   });
// };
