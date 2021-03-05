/// <reference types="cypress" />
import { User } from '../../utils/type';
import { OrganizationCreatePendingPage, OrganizationJoinPendingPage } from '../organization';

export default class AuthIdentityPage {

  constructor() {
  }

  public clickTermsAndCondition() {
    cy.get('.mat-checkbox-inner-container').first().click({ force: true });
  }

  public clickPrivacyPolicy() {
    cy.get('.mat-checkbox-inner-container').last().click({ force: true });
  }

  public fillUserInformations(user: Partial<User>) {
    const name = user.email.split('@')[0];
    cy.get('input[test-id="email"]').type('cmandonnet+e2etest@cascade8.com');
    cy.get('input[formControlName="firstName"]').type(name);
    cy.get('input[formControlName="lastName"]').type(name);
  }

  public fillInvitationCode() {
    cy.get('input[formControlName="generatedPassword"]').type('blockframes');
  }

  public fillPassword() {
    cy.get('input[formControlName="password"]').type('blockframes');
    cy.get('input[formControlName="confirm"]').type('blockframes');
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
