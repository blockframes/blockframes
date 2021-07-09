import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { SEC } from '@blockframes/e2e/utils';

describe('financiers', () => {
  beforeEach(() => {
    cy.wait(10 * SEC);
    clearDataAndPrepareTest('/');
    cy.wait(20 * SEC);
  });

  it('should display welcome message', () => {
    cy.wait(30 * SEC);
    cy.get('financiers-landing h4', {timeout: 30 * SEC})
      .contains('Welcome to Media Financiers');
  });
});
