import FestivalMarketplaceScreeningPage from "./FestivalMarketplaceScreeningPage";

export default class FestivalMarketplaceEventPage {
  constructor() {
    cy.get('festival-event-view');
  }

  assertScreeningExist(movieTitle: string) {
    cy.get('festival-event-view movie-header').should('contain', movieTitle);
  }

  clickJoinScreening() {
    cy.get('festival-event-view a[test-id=event-room]').click();
    return new FestivalMarketplaceScreeningPage();
  }

  assertJoinScreeningNotExists() {
    cy.get('festival-event-view a[test-id=event-room]').should('have.length', 0);
  }
}
