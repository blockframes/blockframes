import { LoginViewPage } from "../auth";

export default class LandingPage {
  constructor() {
    cy.get('catalog-landing-page');
  }

  public clickLogin() {
    cy.get('catalog-toolbar a[test-id=login]').click();
    return new LoginViewPage();
  }
}
