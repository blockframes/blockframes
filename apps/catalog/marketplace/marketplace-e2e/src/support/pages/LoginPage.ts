import HomePage from './HomePage';
export default class LoginPage {

  constructor() {
    cy.get('[test-id=content][page-id=login]');
  }

  public switchMode() {
    cy.get('[test-id=switch-mode] button').click();
  }

  public fillSignin(user) {
    cy.get('[page-id=signin] input[type="email"]').type(user.email);
    cy.get('[page-id=signin] input[type="password"]').type(user.password);
  }

  public clickSignIn(){
    cy.get('[page-id=signin] button[type=submit]').click();
    return new HomePage();
  }
}
