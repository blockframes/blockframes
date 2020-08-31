import FestivalMarketplaceCalendarPage from "./FestivalMarketplaceCalendarPage";
import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";

const PRIVATE = 'Private Screening';
const PUBLIC = 'Public Screening';
const CALENDAR_LABEL = 'My Calendar';

export default class FestivalScreeningPage {
  constructor() {
    cy.get('festival-screening', {timeout: 1000});
    cy.wait(1000);
  }

  assertScreeningsExists(screeningNames: string[]) {
    //TODO: Pass an array of titles
    // get().then((el))
    // Inside for each title from array
    //  assert el contains title

    cy.wait(1000);
    cy.get('festival-screening event-screening-item', {timeout: 1000})
    .then($el => {
      screeningNames.forEach(screeningName => {
        cy.wrap($el).contains(screeningName);
      })
    })
    /* .should('have.length', 4) */
    //.contains(screeningName);
  }

  clickAskForInvitation() {
    cy.get('festival-screening event-screening-item').contains(PRIVATE).first().parent().parent().find('button[test-id=invitation-request]').click();
    cy.wait(3000);
  }

  clickAddToCalendar(screeningTitle: string) {
    cy.get('festival-screening event-screening-item', {timeout: 3000})
      .contains(screeningTitle)
      .parent().parent().parent()
      .find('button[test-id=invitation-request]')
      .click();
    //cy.wait(3000);
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').first().click();
  }

  selectCalendar() {
    cy.get('layout-marketplace a').contains(CALENDAR_LABEL).click();
    return new FestivalMarketplaceCalendarPage();
  }

  clickPrivateEvent() {
    cy.get('festival-screening event-screening-item h3').first().click();
    return new FestivalMarketplaceEventPage();
  }

  clickSpecificEvent(eventName: string) {
    cy.get('article h3', {timeout: 10000})
      .contains(eventName).click();

    return new FestivalMarketplaceEventPage();
  }

  checkEventsInMarket(eventNames: string[]) {
    
    eventNames.forEach(eventName => {
      let pageFestivalMarketplaceEvent = this.clickSpecificEvent(eventName);
      cy.wait(3000);
      pageFestivalMarketplaceEvent.assertEventNameExist(eventName);
    })
  }
}
