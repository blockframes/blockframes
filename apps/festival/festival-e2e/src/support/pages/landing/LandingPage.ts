import { AuthLoginPage } from "@blockframes/e2e/pages/auth";
import { TO } from '@blockframes/e2e/utils';

export default class LandingPage {
  constructor() {
    cy.get('festival-landing', {timeout: TO.PAGE_LOAD});
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
