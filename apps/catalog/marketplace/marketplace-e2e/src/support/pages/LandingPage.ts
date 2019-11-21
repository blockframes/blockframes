import LoginPage from './LoginPage';

export default class LandingPage {
  constructor() {
    cy.get('[page-id=welcome-view]');
  }

  public clickCallToAction(): LoginPage {
    cy.get('a[test-id=call-to-action]').click();
    return new LoginPage();
  }

}
