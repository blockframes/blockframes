export default class LoginPage {
  constructor() {
    cy.get('[test-id=content][page-id=login]');
  }

  public switchMode() {
    cy.get('[test-id=switch-mode] button').click();
  }

  public fillSignup(email, password ) {
    cy.get('[test-id=signup] input[type="email"]').type(email);
    cy.get('[test-id=signup] input[formControlName="surname"]').type('Sam');
    cy.get('[test-id=signup] input[formControlName="name"]').type('Sample');
    cy.get('[test-id=signup] input[test-id="password"]').type(password);
    cy.get('[test-id=signup] input[test-id="password-confirm"]').type(password);
  }

  public fillSignin(email: string, password: string) {
    cy.get('[testid=signin] input[formControlName="email"]').type(email);
    cy.get('[testid=signin] input[formControlName="password"]').type(password);
  }

  public clickSignup() {
    cy.get('[test-id=signup] button[type=submit]').click();
  }

  public clickSignin() {
    cy.get('[testid=signin] button[type=submit]').click();
  }
}
