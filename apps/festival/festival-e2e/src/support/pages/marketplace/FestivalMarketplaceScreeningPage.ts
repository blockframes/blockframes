export default class FestivalMarketplaceScreeningPage {
  constructor() {
    cy.get('festival-session')
  }

  clickPlay() {
    cy.get('festival-session [test-id=play]').click();
  }

  runVideo() {
    cy.get('festival-session video', { timeout: 30000 }).click({ force: true });
  }
}
