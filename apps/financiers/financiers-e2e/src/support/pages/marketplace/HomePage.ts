import { SEC } from '@blockframes/e2e/utils/env';

export default class HomePage {
  constructor() {
    cy.get('financiers-home', {timeout: 120 * SEC});
  }
}
