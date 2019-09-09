import OrganizationHomePage from './HomePage';
import { User } from '../utils/type';

export default class LoginPage {
  constructor() {
    cy.get('[test-id=content][page-id=login]');
  }

  public switchMode() {
    cy.get('[test-id=switch-mode] button').click();
  }

  public fillSignup(user: User) {
    cy.get('[test-id=signup] input[type="email"]').type(user.email);
    cy.get('[test-id=signup] input[test-id="name"]').type(user.name);
    cy.get('[test-id=signup] input[test-id="surname"]').type(user.surname);
    cy.get('[test-id=signup] input[test-id="password"]').type(user.password);
    cy.get('[test-id=signup] input[test-id="password-confirm"]').type(user.password);
  }

  public clickSignup() {
    cy.get('[test-id=signup] button[type=submit]').click();
    return new OrganizationHomePage();
  }
}
