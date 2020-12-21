import { SEC } from "@blockframes/e2e/utils";

export default class FestivalMarketplaceScreeningPage {
  constructor() {
    cy.log('->FestivalMarketplaceScreeningPage: Access festival-session');
    cy.get('festival-session', { timeout: 60 * SEC });
  }

  clickPlay() {
    cy.log('>FestivalMarketplaceScreeningPage: Start Play [test-id=play]');
    cy.get('festival-session [test-id=play]', { timeout: 3 * SEC })
      .click();
    cy.wait(1 * SEC);
  }

  runVideo() {
    cy.log('>FestivalMarketplaceScreeningPage: Play video');
    cy.get('festival-session video', { timeout: 150 * SEC }).click({ force: true });
  }
}
