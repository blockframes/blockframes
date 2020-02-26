/// <reference types="cypress" />

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/auth');
  cy.viewport('ipad-2', 'landscape');
});

describe('User can navigate to the movie tunnel page 2 and fill all the fieldsn and navigate to page 3', () => {
  it('Login into an existing account, navigate on main page, complete main fields, go on movie tunnel page 3', () => {
  });
});
