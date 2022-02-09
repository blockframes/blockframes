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

const fs = require('fs');
const PDFDocument = require('pdfkit');

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const createFakeScript = (title) => {
  const path = `test-${title}.pdf`;
  const doc = new PDFDocument();

  const stream = doc.pipe(fs.createWriteStream(path));
  doc.fontSize(25)
    .text(title, 100, 100);
  doc.end();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      resolve(path);
    });
  });
};

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome' && config.env.incognito) {
      launchOptions.args.push("--incognito");
    }
    return launchOptions;
  });

  on('task', {
    'random:pdf': createFakeScript
  });
};
