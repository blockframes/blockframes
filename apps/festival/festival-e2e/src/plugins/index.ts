/* eslint-disable no-console */
// ***********************************************************
// This example plugins/index.ts can be used to load plugins
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

  // Preprocess Typescript file using Nx helper

  console.log('Node version:', process.version);
  console.log('Config: ', config);
  // // A plugin example. Can modify printed configs.
  // on('before:browser:launch', (arg1, arg2) => {
  //   console.log('Plugin Arg1', arg1);
  //   console.log('Plugin Arg2', arg2);
  // });

  // tslint:disable-next-line: no-unused-expression
  // on('task', cypress.getCypressTasks(config));

  // * Returning config here (or promise) changes config.
}) as Cypress.PluginConfig;
// cypress/plugins/index.ts

// /// <reference types="cypress" />

// /**
//  * @type {Cypress.PluginConfig}
//  */
// module.exports = (on, config) => {};
