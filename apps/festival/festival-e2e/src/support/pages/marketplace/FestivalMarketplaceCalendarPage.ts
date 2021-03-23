import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";
import { SEC } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceCalendarPage {
  constructor() {
    cy.get('festival-event-calendar', {timeout: 30 * SEC});
    cy.wait(5 * SEC);
  }

  clickOnEvent(movieTitle: string) {
    cy.get('festival-marketplace main', {timeout: 3 * SEC})
      .scrollTo('top');
    cy.wait(2 * SEC);
    cy.get('festival-event-calendar event-card h5[test-id=movie-title]', {timeout: 30 * SEC})
      .contains(movieTitle).click();
    return new FestivalMarketplaceEventPage();
  }
}
