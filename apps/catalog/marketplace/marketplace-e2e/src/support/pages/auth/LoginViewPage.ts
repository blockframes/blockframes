import { User } from '../../utils/type';
import { HomePage, OrganizationHomePage } from '..';

export default class LoginViewPage {

  constructor() {
    cy.get('[page-id=login-view]');
  }

  public switchMode() {
    cy.get('[test-id=switch-mode] button').click();
  }

  // Signup

  public fillEmailInSignup(user: User) {
    cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
  }

  public fillSignup(user: User) {
    cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
    cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
    cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
    cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
    cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
  }

  public clickTermsAndCondition() {
    cy.get('[page-id=terms-condition] [test-id="checkbox"]').click();
  }

  public clickSignup() {
    cy.get('[page-id=signup-form] button[type=submit]').click();
    return new OrganizationHomePage();
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
