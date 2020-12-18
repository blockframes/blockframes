import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";
import { SEC } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceCalendarPage {
  constructor() {
    cy.get('festival-event-calendar')
  }

  clickOnEvent(movieTitle: string) {
    cy.get('festival-marketplace main', {timeout: 3 * SEC})
      .scrollTo('top');
    cy.wait(1 * SEC);
    cy.get('festival-event-calendar event-card h5[test-id=movie-title]')
      .contains(movieTitle).click();
    return new FestivalMarketplaceEventPage();
  }
}
