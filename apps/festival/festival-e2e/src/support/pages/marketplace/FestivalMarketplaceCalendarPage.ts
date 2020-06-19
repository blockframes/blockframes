import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";

export default class FestivalMarketplaceCalendarPage {
  constructor() {
    cy.get('festival-event-calendar')
  }

  clickOnEvent(movieTitle: string) {
    cy.get('festival-event-calendar event-card h5[test-id=movie-title]').contains(movieTitle).click();
    return new FestivalMarketplaceEventPage();
  }
}
