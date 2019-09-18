import { User } from '../utils/type';
import OrganizationHomePage from './OrganizationHomePage';
import MovieCreatePage from './MovieCreatePage';
import HomePage from './HomePage';

export default class LoginPage {
  constructor() {
    cy.get('[test-id=content][page-id=login]', {timeout: 10000});
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

  public fillSignin(user: Partial<User>) {
    cy.get('[page-id=signin] input[type="email"]').type(user.email);
    cy.get('[page-id=signin] input[type="password"]').type(user.password);
  }

  public clickSigninWithNoMovies() {
    cy.get('[page-id=signin] button[type=submit]').click();
    return new MovieCreatePage();
  }

  public clickSigninWithMovies() {
    cy.get('[page-id=signin] button[type=submit]').click();
    return new HomePage();
  }

}
