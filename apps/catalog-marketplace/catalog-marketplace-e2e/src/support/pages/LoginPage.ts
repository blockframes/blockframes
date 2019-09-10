import { User } from "../utils/types";
import OrganizationHomePage from "./OrganizationHomePage";

export default class LoginPage {
  constructor() {
    cy.get('[test-id=signup]')
  }

  public goToSignUp(){
    cy.get('button[id=tosignup]').click();
  }

  public fillSignUpForm(user: User){
    cy.get('[test-id=signup] input[type=email]').type(user.email);
    cy.get('[test-id=signup] input[test-id=name]').type(user.firstName);
    cy.get('[test-id=signup] input[test-id=surname]').type(user.lastName);
    cy.get('[test-id=signup] input[test-id=password]').type(user.pw);
    cy.get('[test-id=signup] input[test-id=password-confirm]').type(user.pw);
  }

  public submitSignUp(){
    cy.get('[test-id=signup] button[type=submit]').click();
    return new OrganizationHomePage;
  }
}
