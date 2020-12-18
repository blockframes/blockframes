import FestivalMarketplaceScreeningPage from "./FestivalMarketplaceScreeningPage";
import FestivalScreeningPage from "./FestivalScreeningPage";
import { SEC } from "@blockframes/e2e/utils";

export default class FestivalMarketplaceEventPage {
  constructor() {
    cy.wait(3 * SEC);
    cy.get('festival-event-view', {timeout: 90 * SEC});
  }

  assertScreeningExist(movieTitle: string) {
    cy.get('festival-event-view movie-header').should('contain', movieTitle);
  }

  clickJoinScreening() {
    cy.log('Going for screening: (festival-event-view a[test-id=event-room])');
    cy.get('festival-event-view a[test-id=event-room]', {timeout: 3 * SEC})
      .click();
    cy.wait(1 * SEC);
    return new FestivalMarketplaceScreeningPage();
  }

  assertJoinScreeningNotExists() {
    cy.log(`assertJoinScreeningNotExists : join screen should not exist!`);
    cy.get('festival-event-view a[test-id=event-room]')
      .should('have.length', 0);
  }

  assertEventNameExist(eventName: string) {
    cy.log(`assertEventNameExist : header for {${eventName}}!`);
    cy.get('festival-event-view header', {timeout: 3 * SEC})
      .should('contain', eventName);
  }

  clickBackToEventList() {
    cy.get('festival-event-view header a').first().click();
    return new FestivalScreeningPage();
  }
}
