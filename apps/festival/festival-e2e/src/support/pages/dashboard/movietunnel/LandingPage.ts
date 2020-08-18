export default class LandingPage {
  constructor() {
    cy.get('catalog-landing');
  }

  public clickLogin() {
    cy.get('landing-toolbar a[test-id=login]').click();
  }

  public clickSignup() {
    cy.get('landing-toolbar a[test-id=signup]').click();
  }
}
