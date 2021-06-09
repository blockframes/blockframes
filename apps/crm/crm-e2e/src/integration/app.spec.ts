import { SEC } from '@blockframes/e2e/utils';

describe('crm-crm', () => {
  beforeEach(() => {
    cy.wait(10 * SEC);
    cy.visit('/');
    cy.wait(20 * SEC);
  });

  it('TBD Test', () => {
    cy.wait(300 * SEC);
  });
});
