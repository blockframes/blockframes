import { TO } from "@blockframes/e2e/utils";

export default class FestivalMarketplaceScreeningPage {
  constructor() {
    cy.log('->FestivalMarketplaceScreeningPage: Access festival-session');
    cy.get('festival-session', {timeout: TO.PAGE_LOAD});
  }

  clickPlay() {
    cy.log('>FestivalMarketplaceScreeningPage: Start Play [test-id=play]');
    cy.get('festival-session [test-id=play]', {timeout: TO.PAGE_ELEMENT})
      .click();
    cy.wait(TO.ONE_SEC);
  }

  runVideo() {
    cy.log('>FestivalMarketplaceScreeningPage: Play video');
    cy.get('festival-session video', { timeout: TO.VSLOW_UPDATE })
      .click({ force: true });
  }
}
