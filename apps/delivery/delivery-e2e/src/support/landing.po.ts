/// <reference types="cypress" />

import { HomePage } from "./home.po";

export class LandingPage {
  constructor() {
    cy.contains('Sign in');
  }

  public fillSigninEmail(email: string) {
    cy.get('#signin input[type="email"]').type(email);
  }

  public fillSigninPassword(password: string) {
    cy.get('#signin input[type="password"]').type(password);
  }

  public login(): any {
    cy.get('button').contains('Signin').click();
    return new HomePage();
  }

  public fillSignupEmail(email: string) {
    cy.get('#signup input[type="email"]').type(email);
  }

  public fillSignupPassword(password: string) {
    cy.get('#signup input[type="password"]').eq(0).type(password);
    cy.get('#signup input[type="password"]').eq(1).type(password);
  }

  public signup(): any {
    cy.get('button').contains('Signup').click();
    return new HomePage();
  }
}
