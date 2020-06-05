export default class FestivalMarketplaceScreeningPage {
  constructor() {
    cy.get('festival-event-view')
  }

  assertScreeningExist(movieTitle: string) {
    cy.get('festival-event-view movie-header').should('contain', movieTitle);
  }
}
