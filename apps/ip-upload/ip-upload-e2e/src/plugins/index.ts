// ***********************************************************
// This plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const createFakeScript = (title: string): Promise<string> => {
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
  on('task', {
    'random:pdf': createFakeScript
  });
};
