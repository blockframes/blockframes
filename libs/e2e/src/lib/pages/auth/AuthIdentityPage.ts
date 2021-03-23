/// <reference types="cypress" />
import { User } from '../../utils/type';
import { SEC } from '../../utils/env';

export default class AuthIdentityPage {

  constructor() {
    cy.get('auth-identity', { timeout: 60 * SEC });
  }

  // SINGLE FIELD
  public fillEmail(email: string) {
    cy.get('input[test-id="email"]').type(email);
  }

  public fillFirstname(firstname: string) {
    cy.get('input[formControlName="firstName"]').type(firstname);
  }

  public fillLastname(lastname: string) {
    cy.get('input[formControlName="lastName"]').type(lastname);
  }

  public fillInvitationCode() {
    cy.get('input[test-id="invitation-code"]').type('blockframes');
  }

  public fillPassword(password: string) {
    cy.get('input[test-id="password"]').type(password);
  }

  public fillConfirmedPassword(password: string) {
    cy.get('input[test-id="password-confirm"]').type(password);
  }

  // PARTIAL OR ENTIRE USER FORM
  public fillFirstAndLastName(user: Partial<User>) {
    this.fillFirstname(user.firstName);
    this.fillLastname(user.lastName);
  }

  public fillPasswordAndConfirmPassword(password: string) {
    this.fillPassword(password);
    this.fillConfirmedPassword(password);
  }

  public fillUserInformations(user: Partial<User>) {
    cy.get('input[test-id="email"]').type(user.email);
    cy.get('input[formControlName="firstName"]').type(user.firstName);
    cy.get('input[formControlName="lastName"]').type(user.lastName);
    cy.get('input[test-id="password"]').type(user.password);
    cy.get('input[test-id="password-confirm"]').type(user.password);
  }

  public fillSignupExceptOne(user: Partial<User>, key, newEmail?) {
    const originalEmail = user.email;
    if (newEmail){
      user.email = newEmail;
    }
    switch (key) {
      case 'email' :
        cy.get('input[formControlName="firstName"]').type(user.firstName);
        cy.get('input[formControlName="lastName"]').type(user.lastName);
        cy.get('input[test-id="password"]').type(user.password);
        cy.get('input[test-id="password-confirm"]').type(user.password);
        break;
      case 'name' :
        cy.get('input[test-id="email"]').type(user.email);
        cy.get('input[formControlName="lastName"]').type(user.lastName);
        cy.get('input[test-id="password"]').type(user.password);
        cy.get('input[test-id="password-confirm"]').type(user.password);
        user.email = originalEmail;
        break;
      case 'surname' :
        cy.get('input[test-id="email"]').type(user.email);
        cy.get('input[formControlName="firstName"]').type(user.firstName);
        cy.get('input[test-id="password"]').type(user.password);
        cy.get('input[test-id="password-confirm"]').type(user.password);
        user.email = originalEmail;
        break;
      case 'password' :
        cy.get('input[test-id="email"]').type(user.email);
        cy.get('input[formControlName="firstName"]').type(user.firstName);
        cy.get('input[formControlName="lastName"]').type(user.lastName);
        cy.get('input[test-id="password-confirm"]').type(user.password);
        user.email = originalEmail;
        break;
      case 'passwordConfirm' :
        cy.get('input[test-id="email"]').type(user.email);
        cy.get('input[formControlName="firstName"]').type(user.firstName);
        cy.get('input[formControlName="lastName"]').type(user.lastName);
        cy.get('input[test-id="password"]').type(user.password);
        user.email = originalEmail;
        break
    }
  }

  // TERMS, CONDITION AND SUBMIT
  public clickTermsAndCondition() {
    cy.get('.mat-checkbox-inner-container').first().click({ force: true });
  }

  public clickPrivacyPolicy() {
    cy.get('.mat-checkbox-inner-container').last().click({ force: true });
  }

  public submitForm() {
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
  }

  // VERIFICATION

  public checkSignUpButtonIsDisabled() {
    cy.get('button[type="submit"]').should('be.disabled');
  }
}
