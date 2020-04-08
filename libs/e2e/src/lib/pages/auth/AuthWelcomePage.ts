import AuthLoginPage from './AuthLoginPage';

export default class AuthWelcomePage {
  constructor() {
    cy.get('auth-welcome-view', {timeout: 10000});
  }

  public clickCallToAction(): AuthLoginPage {
    cy.get('auth-welcome-view [test-id=call-to-action]').click();
    return new AuthLoginPage();
  }
}
