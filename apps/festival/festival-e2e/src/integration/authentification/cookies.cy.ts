import { get } from '@blockframes/testing/cypress/browser';

describe('Cookies', () => {
  it('can accept cookies', () => {
    cy.visit('');
    cy.visit('auth/identity');
    get('cookies').should('exist').click();
    get('cookies').should('not.exist');
  });
});
