import { AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { TO } from '@blockframes/e2e/utils/env';

export default class LandingPage {
  constructor() {
    cy.get('catalog-landing');
    cy.get('button[test-id="accept-cookies"]', {timeout: TO.THREE_SEC})
    .click();
    cy.wait(TO.WAIT_1SEC);
  }

  public clickLogin() {
    cy.get('mat-toolbar a[test-id=login]').click();
    return new AuthLoginPage();
  }

  public clickSignup() {
    cy.get('mat-toolbar a[test-id=signup]').click();
    return new AuthLoginPage();
  }
}
