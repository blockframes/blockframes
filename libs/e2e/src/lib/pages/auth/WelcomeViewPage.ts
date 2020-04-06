import LoginViewPage from './LoginViewPage';

export default class WelcomeViewPage {
  constructor() {
    cy.get('[page-id=welcome-view]', {timeout: 10000});
  }

  public clickCallToAction(): LoginViewPage {
    cy.get('[page-id=welcome-view] [test-id=call-to-action]').click();
    return new LoginViewPage();
  }
}
