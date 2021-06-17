import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";
import { SEC } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceCalendarPage {
  constructor() {
    cy.get('festival-event-calendar', {timeout: 30 * SEC});
    cy.wait(5 * SEC);
  }

  clickOnEvent(movieTitle: string, checkNextWeek: boolean = false) {
    cy.get('festival-marketplace main', {timeout: 30 * SEC})
      .scrollTo('top');
    cy.wait(5 * SEC);

    if (checkNextWeek) {
    //Advance the calendar if event happens to be next week
    const day = (new Date()).getDay();
      if (day > 4) {
        cy.log('Checking next week schedule..')
        cy.get('button[test-id=arrow_forward]', {timeout: 3 * SEC})
          .click();
        cy.wait(1 * SEC);
      }
    }

    //Locate movie card by the name movieTitle
    cy.log(`FestivalMarketplaceCalendarPage: searching for card: ${movieTitle}`);
    cy.get('festival-event-calendar event-card h5[test-id="movie-title"]', {timeout: 90 * SEC})
      .contains(movieTitle).click();
    cy.wait(1 * SEC);
    return new FestivalMarketplaceEventPage();
  }
}
