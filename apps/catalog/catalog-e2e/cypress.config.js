const { defineConfig } = require('cypress')

module.exports = defineConfig({
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  video: true,
  videosFolder: '../../../dist/cypress/apps/catalog-e2e/videos',
  screenshotsFolder: '../../../dist/cypress/apps/catalog-e2e/screenshots',
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../dist/test-reports/catalog-[hash].xml',
  },
  retries: {
    runMode: 2,
    openMode: 2,
  },
  blockHosts: ['*google-analytics.com', '*googleapis.com', '*imgix.net'],
  viewportWidth: 1920,
  viewportHeight: 1080,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./src/plugins/index.ts').default(on, config)
    },
    specPattern: './src/integration/**/deal-display-offer.cy.ts',
    supportFile: './src/support/index.ts',
  },
})
