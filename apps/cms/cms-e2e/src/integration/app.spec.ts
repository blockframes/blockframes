import { SEC } from '@blockframes/e2e/utils';

describe('cms-cms', () => {
  beforeEach(() => {
    cy.wait(1 * SEC);
    cy.visit('/');
    cy.wait(1 * SEC);
  });

  it('TBD Test', () => {
    cy.wait(1 * SEC);
  });
});
