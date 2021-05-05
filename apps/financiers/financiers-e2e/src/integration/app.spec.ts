import { clearDataAndPrepareTest } from '@blockframes/e2e/utils/functions';
import { SEC } from '@blockframes/e2e/utils';

describe('financiers', () => {
  beforeEach(() =>{
    clearDataAndPrepareTest('/');
  });

  it('should display welcome message', () => {
    cy.get('financiers-landing h4', {timeout: 30 * SEC})
      .contains('Welcome to Media Financiers');
  });
});
