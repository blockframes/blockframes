/// <reference types="cypress" />

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/'); // TODO: we should visit the root path instead of /auth
  cy.viewport('macbook-15');
});

describe('story #569 - main app', () => {
  it('should exists', () => {
    cy.visit('/');
  });
});
