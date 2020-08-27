/// <reference types="cypress" />
import { User } from '../../utils/type';

export default class AuthIdentityPage {

  constructor() {
  }

  public clickTermsAndCondition() {
    cy.get('.mat-checkbox-inner-container').first().click({ force: true });
  }

  public clickPrivacyPolicy() {
    cy.get('.mat-checkbox-inner-container').last().click({ force: true });
  }

  public confirm(user: Partial<User>) {
    const name = user.email.split('@')[0];
    cy.get('input[formControlName="firstName"]').type(name);
    cy.get('input[formControlName="lastName"]').type(name);
    cy.get('input[formControlName="generatedPassword"]').type('blockframes');
    cy.get('input[formControlName="password"]').type('blockframes');
    cy.get('input[formControlName="confirm"]').type('blockframes');
    this.clickTermsAndCondition();
    this.clickPrivacyPolicy();
    cy.get('button[type="submit"]').click();
    cy.wait(5000);
  }
}
