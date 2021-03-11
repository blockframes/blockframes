import { User } from '../../utils/type';
import { AuthIdentityPage } from '../auth';
import { SEC } from '../../utils/env';

export default class AuthLoginPage {

  constructor() {
    cy.get('auth-login-view', {timeout: 60 * SEC});
  }

  public assertStayInLoginView() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/auth/connexion')
    })
  }

  public fillSignin(user) {
    cy.get('auth-signin-form input[type="email"]').type(user.email);
    cy.get('auth-signin-form input[type="password"]').type(user.password);
  }

  /** Connection returns to the home page of the application in which you are. You have to create it. */
  public clickSignIn() {
    cy.get('auth-signin-form button[type=submit]', {timeout: 3 * SEC})
      .click();
    cy.wait(3 * SEC);
  }

  public goToSignUpPage() {
    cy.get('button[id="tosignup"]').click();
    return new AuthIdentityPage();
  }

}
