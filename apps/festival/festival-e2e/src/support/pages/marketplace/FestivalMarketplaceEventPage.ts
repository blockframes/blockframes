import FestivalMarketplaceScreeningPage from "./FestivalMarketplaceScreeningPage";

export default class FestivalMarketplaceEventPage {
  constructor() {
    cy.get('festival-event-view')
  }

  assertScreeningExist(movieTitle: string) {
    cy.get('festival-event-view movie-header').should('contain', movieTitle);
  }

  clickJoinScreening() {
    return new FestivalMarketplaceScreeningPage
  }
}
