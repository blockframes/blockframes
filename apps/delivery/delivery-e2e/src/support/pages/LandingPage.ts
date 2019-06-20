import HomePage from "./HomePage";

export default class LandingPage {
  constructor() {
    cy.get('[testId=signup]');
    cy.get('[testId=signin]');
  }

  public fillSigninEmail(email: string) {
    cy.get('[testId=signin] input[type="email"]').type(email);
  }

  public fillSigninPassword(password: string) {
    cy.get('[testId=signin] input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('[testId=signin] button').click();
    return new HomePage();
  }

  public fillSignupEmail(email: string) {
    cy.get('[testId=signup] input[type="email"]').type(email);
  }

  public fillSignupPassword(password: string) {
    cy.get('[testId=signup] input[type="password"]').eq(0).type(password);
    cy.get('[testId=signup] input[type="password"]').eq(1).type(password);
  }

  public signup(): any {
    cy.get('[testId=signup] button').click();
    return new HomePage();
  }
}
