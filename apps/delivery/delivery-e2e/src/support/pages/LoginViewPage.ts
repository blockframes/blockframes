import { User } from '../utils/type';
import OrganizationHomePage from './OrganizationHomePage';
import MovieCreatePage from './MovieCreatePage';
import HomePage from './HomePage';

export default class LoginViewPage {
  constructor() {
    cy.get('[page-id=login-view]', {timeout: 10000});
  }

  public switchMode() {
    cy.get('[page-id=login-view] [test-id=switch-mode] button').click();
  }

  public fillSignup(user: User) {
    cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
    cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
    cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
    cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
    cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
  }

  public clickSignup() {
    cy.get('[page-id=signup-form] button[type=submit]').click();
    return new OrganizationHomePage();
  }

  public fillSignin(user: Partial<User>) {
    cy.get('[page-id=signin-form] input[type="email"]').type(user.email);
    cy.get('[page-id=signin-form] input[type="password"]').type(user.password);
  }

  public clickSigninWithNoMovies() {
    cy.get('[page-id=signin-form] button[type=submit]').click();
    return new MovieCreatePage();
  }

  public clickSigninWithMovies() {
    cy.get('[page-id=signin-form] button[type=submit]').click();
    return new HomePage();
  }

}
