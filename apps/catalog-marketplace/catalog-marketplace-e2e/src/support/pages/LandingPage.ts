import { LoginPage } from ".";

export default class LandingPage {
  constructor() {}

  public clickAccess(){
    cy.get('button[test-id=call-to-action]').click();
    return new LoginPage;
  }
}
