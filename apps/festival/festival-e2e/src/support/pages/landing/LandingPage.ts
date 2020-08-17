import { AuthLoginPage } from "@blockframes/e2e/pages/auth";

export default class LandingPage {
  constructor() {
    cy.get('festival-landing');
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
