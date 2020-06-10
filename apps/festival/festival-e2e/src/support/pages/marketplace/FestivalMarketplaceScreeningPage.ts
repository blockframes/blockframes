export default class FestivalMarketplaceScreeningPage {
  constructor() {
    cy.get('festival-session')
  }

  clickPlay() {
    cy.get('festival-session [test-id=play]').click();
  }
}
