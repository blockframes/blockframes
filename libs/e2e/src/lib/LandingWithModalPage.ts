import { HomePage } from './HomePage';

export class LandingWithModalPage {
  constructor() {
    cy.contains('Login');
  }

  public fillEmail(email: string) {
    cy.get('input[type="email"]')
      .type(email)
      .then(() => this);
  }

  public fillPassword(password: string) {
    cy.get('input[type="password"]')
      .type(password)
      .then(() => this);
  }

  public login(): any {
    cy.get('button')
      .contains('Login')
      .click();
    return new HomePage();
  }
}
