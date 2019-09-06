import HomePage from './HomePage';

export default class LoginPage {
  constructor() {
    cy.get('[test-id=content][page-id=login]');
  }

  public switchMode() {
    cy.get('[test-id=switch-mode] button').click();
  }

  public fillSignup({ email, password, passwordConfirm }) {
    cy.get('[test-id=signup] input[type="email"]').type(email);
    cy.get('[test-id=signup] input[test-id="name"]').type('hugo');
    cy.get('[test-id=signup] input[test-id="surname"]').type('boss');
    cy.get('[test-id=signup] input[test-id="password"]').type(password);
    cy.get('[test-id=signup] input[test-id="password-confirm"]').type(password);
  }

  public clickSignup(): any {
    cy.get('[test-id=signup] button[type=submit]').click();
    return new HomePage();
  }
}
