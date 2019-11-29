/// <reference types="cypress" />

global.beforeEach(() => {
  cy.clearCookies();
  cy.visit('/');
  cy.viewport('macbook-15');
});
