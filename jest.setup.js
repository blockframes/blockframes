/// <reference types="cypress" />
import 'jest-preset-angular';

global.beforeEach(() => {
  cy.clearCookies();
  cy.visit('/');
  cy.viewport('macbook-15');
});
