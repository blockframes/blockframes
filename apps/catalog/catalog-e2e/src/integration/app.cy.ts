import { get } from '@blockframes/testing/cypress/browser';

describe('Landing', () => {
  it('landing page is accessible', () => {
    cy.visit('');
    get('landing-catalog').should('exist');
  });
});
