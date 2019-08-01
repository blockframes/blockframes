import HomePage from './HomePage';
import {LoginPage} from '@blockframes/auth';

export default class LandingPage {
  constructor() {
    cy.get('[test-id=content][page-id=landing]');
  }

  public clickCallToAction(): LoginPage {
    cy.get('[test-id=call-to-action]').click();
    return new LoginPage();
  }
}
