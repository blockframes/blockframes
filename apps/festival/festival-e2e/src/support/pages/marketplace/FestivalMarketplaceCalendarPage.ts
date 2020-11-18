import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";
import { TO } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceCalendarPage {
  constructor() {
    cy.get('festival-event-calendar')
  }

  clickOnEvent(movieTitle: string) {
    cy.get('festival-marketplace main', {timeout: TO.PAGE_ELEMENT})
      .scrollTo('top');
    cy.wait(TO.WAIT_1SEC);
    cy.get('festival-event-calendar event-card h5[test-id=movie-title]')
      .contains(movieTitle).click();
    return new FestivalMarketplaceEventPage();
  }
}
