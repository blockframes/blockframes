import FestivalMarketplaceScreeningPage from "./FestivalMarketplaceScreeningPage";
import FestivalScreeningPage from "./FestivalScreeningPage";

export default class FestivalMarketplaceEventPage {
  constructor() {
    cy.wait(3000);
    cy.get('festival-event-view', {timeout: 90000});
  }

  assertScreeningExist(movieTitle: string) {
    cy.get('festival-event-view movie-header').should('contain', movieTitle);
  }

  clickJoinScreening() {
    cy.get('festival-event-view a[test-id=event-room]').click();
    return new FestivalMarketplaceScreeningPage();
  }

  assertJoinScreeningNotExists() {
    cy.log(`assertJoinScreeningNotExists : join screen should not exist!`);
    cy.get('festival-event-view a[test-id=event-room]')
      .should('have.length', 0);
  }

  assertEventNameExist(eventName: string) {
    cy.log(`assertEventNameExist : header for {${eventName}}!`);
    cy.get('festival-event-view header', {timeout: 30000})
      .should('contain', eventName);
  }

  clickBackToEventList() {
    cy.get('festival-event-view header a').first().click();
    return new FestivalScreeningPage();
  }
}
