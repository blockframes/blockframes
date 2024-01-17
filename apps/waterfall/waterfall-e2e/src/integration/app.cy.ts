import { get } from '@blockframes/testing/cypress/browser';

describe('Landing', () => {
  it('landing page redirect to auth', () => {
    cy.visit('');
    get('auth-login-view').should('exist');
  });
});
