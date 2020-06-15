import { User } from '../../utils/type';
import { OrganizationHomePage } from '../organization';

export default class AuthLoginPage {

  constructor() {
    cy.get('auth-login-view');
  }

  public switchMode() {
    cy.get('auth-login-view [test-id=switch-mode] button').click();
  }

  // Signup

  public fillEmailInSignup(email: string) {
    cy.get('auth-signup-form input[type="email"]').type(email);
  }

  public fillNameInSignup(name: string) {
    cy.get('auth-signup-form input[test-id="name"]').type(name);
  }

  public fillSurnameInSignup(surname: string) {
    cy.get('auth-signup-form input[test-id="surname"]').type(surname);
  }

  public fillPasswordInSignup(password: string) {
    cy.get('auth-signup-form input[test-id="password"]').type(password);
  }

  public fillPasswordConfirmInSignup(password: string) {
    cy.get('auth-signup-form input[test-id="password-confirm"]').type(password);
  }

  public fillSignup(user: Partial<User>) {
    cy.get('auth-signup-form input[type="email"]').type(user.email);
    cy.get('auth-signup-form input[test-id="name"]').type(user.firstName);
    cy.get('auth-signup-form input[test-id="surname"]').type(user.lastName);
    cy.get('auth-signup-form input[test-id="password"]').type(user.password);
    cy.get('auth-signup-form input[test-id="password-confirm"]').type(user.password);
  }

  public fillSignupExceptOne(user: Partial<User>, key, newEmail?) {
    const originalEmail = user.email;
    if (newEmail){
      user.email = newEmail;
    }
    switch (key) {
      case 'email' :
          cy.get('auth-signup-form input[test-id="name"]').type(user.firstName);
          cy.get('auth-signup-form input[test-id="surname"]').type(user.lastName);
          cy.get('auth-signup-form input[test-id="password"]').type(user.password);
          cy.get('auth-signup-form input[test-id="password-confirm"]').type(user.password);
        break;
      case 'name' :
          cy.get('auth-signup-form input[type="email"]').type(user.email);
          cy.get('auth-signup-form input[test-id="surname"]').type(user.lastName);
          cy.get('auth-signup-form input[test-id="password"]').type(user.password);
          cy.get('auth-signup-form input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'surname' :
          cy.get('auth-signup-form input[type="email"]').type(user.email);
          cy.get('auth-signup-form input[test-id="name"]').type(user.firstName);
          cy.get('auth-signup-form input[test-id="password"]').type(user.password);
          cy.get('auth-signup-form input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'password' :
          cy.get('auth-signup-form input[type="email"]').type(user.email);
          cy.get('auth-signup-form input[test-id="name"]').type(user.firstName);
          cy.get('auth-signup-form input[test-id="surname"]').type(user.lastName);
          cy.get('auth-signup-form input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'passwordConfirm' :
          cy.get('auth-signup-form input[type="email"]').type(user.email);
          cy.get('auth-signup-form input[test-id="name"]').type(user.firstName);
          cy.get('auth-signup-form input[test-id="surname"]').type(user.lastName);
          cy.get('auth-signup-form input[test-id="password"]').type(user.password);
          user.email = originalEmail;
        break
    }
  }

  public clickTermsAndCondition() {
    cy.get('auth-accept-conditions [test-id="checkbox"] input').first().check({ force: true });
  }

  public clickPrivacyPolicy() {
    cy.get('auth-accept-conditions [test-id="checkbox"] input').last().check({ force: true });
  }

  public clickSignupToOrgHome() {
    cy.get('auth-signup-form button[type=submit]').click();
    return new OrganizationHomePage();
  }

  public clickSignup() {
    cy.get('auth-signup-form button[type=submit]').click({ force: true });
  }

  public assertStayInLoginView() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/auth/connexion')
    })
  }

  // Signin

  public fillSignin(user) {
    cy.get('auth-signin-form input[type="email"]').type(user.email);
    cy.get('auth-signin-form input[type="password"]').type(user.password);
  }

  /** Connection returns to the home page of the application in which you are. You have to create it. */
  public clickSignIn() {
    cy.get('auth-signin-form button[type=submit]').click();
  }

  public clickSigninToOrgHome() {
    cy.get('auth-signin-form button[type=submit]').click();
    return new OrganizationHomePage();
  }
}
