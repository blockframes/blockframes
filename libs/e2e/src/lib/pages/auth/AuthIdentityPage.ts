/// <reference types="cypress" />
import { User } from '../../utils/type';
import { OrganizationCreatePendingPage, OrganizationJoinPendingPage } from '../organization';
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
    cy.get('input[formControlName="generatedPassword"]').type('blockframes');
  }

  public fillPassword(password: string) {
    cy.get('input[formControlName="password"]').type(password);
  }

  public fillConfirmedPassword(password: string) {
    cy.get('input[formControlName="confirm"]').type(password);
  }

  // ENTIRE USER FORM
  public fillUserInformations(user: Partial<User>) {
    cy.get('input[test-id="email"]').type(user.email);
    cy.get('input[formControlName="firstName"]').type(user.firstName);
    cy.get('input[formControlName="lastName"]').type(user.lastName);
    cy.get('input[formControlName="password"]').type(user.password);
    cy.get('input[formControlName="confirm"]').type(user.password);
  }

  // TERMS, CONDITION AND SUBMIT
  public clickTermsAndCondition() {
    cy.get('.mat-checkbox-inner-container').first().click({ force: true });
  }

  public clickPrivacyPolicy() {
    cy.get('.mat-checkbox-inner-container').last().click({ force: true });
  }

  public submitCreationOrg() {
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    return new OrganizationCreatePendingPage;
  }

  public submitJoinOrg() {
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
    return new OrganizationJoinPendingPage;
  }
}
