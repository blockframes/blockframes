import { AuthIdentityPage, AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { SEC } from '@blockframes/e2e/utils/env';

export default class LandingPage {
  constructor() {
    cy.get('catalog-landing');
    cy.get('button[test-id="cookies"]', { timeout: 3 * SEC }).click();
    cy.wait(1 * SEC);
  }

  public clickLogin() {
    cy.get('mat-toolbar a[test-id=login]').click();
    return new AuthLoginPage();
  }

  public clickSignup() {
    cy.get('mat-toolbar a[test-id=signup]').click();
    return new AuthIdentityPage();
  }
}
