import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

export default class LandingPage {
  constructor() {
    cy.get('catalog-landing-page');
  }

  public clickLogin() {
    cy.get('landing-toolbar a[test-id=login]').click();
    return new AuthLoginPage();
  }

  public clickSignup() {
    cy.get('landing-toolbar a[test-id=signup]').click();
    return new AuthLoginPage();
  }
}
