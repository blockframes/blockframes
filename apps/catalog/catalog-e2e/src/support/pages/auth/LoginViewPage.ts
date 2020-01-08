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

  public fillEmailInSignup(email: string) {
    cy.get('[page-id=signup-form] input[type="email"]').type(email);
  }

  public fillNameInSignup(name: string) {
    cy.get('[page-id=signup-form] input[test-id="name"]').type(name);
  }

  public fillSurnameInSignup(surname: string) {
    cy.get('[page-id=signup-form] input[test-id="surname"]').type(surname);
  }

  public fillPasswordInSignup(password: string) {
    cy.get('[page-id=signup-form] input[test-id="password"]').type(password);
  }

  public fillPasswordConfirmInSignup(password: string) {
    cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(password);
  }

  public fillSignup(user: Partial<User>) {
    cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
    cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
    cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
    cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
    cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
  }

  public fillSignupExceptOne(user: Partial<User>, key, newEmail?) {
    const originalEmail = user.email;
    if (newEmail){
      user.email = newEmail;
    }
    switch (key) {
      case 'email' :
          cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
          cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
          cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
          cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
        break;
      case 'name' :
          cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
          cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
          cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
          cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'surname' :
          cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
          cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
          cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
          cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'password' :
          cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
          cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
          cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
          cy.get('[page-id=signup-form] input[test-id="password-confirm"]').type(user.password);
          user.email = originalEmail;
        break;
      case 'passwordConfirm' :
          cy.get('[page-id=signup-form] input[type="email"]').type(user.email);
          cy.get('[page-id=signup-form] input[test-id="name"]').type(user.name);
          cy.get('[page-id=signup-form] input[test-id="surname"]').type(user.surname);
          cy.get('[page-id=signup-form] input[test-id="password"]').type(user.password);
          user.email = originalEmail;
        break
    }
  }

  public clickTermsAndCondition() {
    cy.get('[page-id=accept-condition] [test-id="checkbox"]').click();
  }

  public clickSignupToOrgHome() {
    cy.get('[page-id=signup-form] button[type=submit]').click();
    return new OrganizationHomePage();
  }

  public clickSignup() {
    cy.get('[page-id=signup-form] button[type=submit]').click();
  }

  public assertStayInLoginview() {
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/auth/connexion')
    })
  }

    // Signin

  public fillSignin(user) {
    cy.get('[page-id=signin] input[type="email"]').type(user.email);
    cy.get('[page-id=signin] input[type="password"]').type(user.password);
  }

  public clickSignIn(){
    cy.get('[page-id=signin] button[type=submit]').click();
    return new HomePage();
  }
}
