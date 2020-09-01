import FestivalMarketplaceCalendarPage from "./FestivalMarketplaceCalendarPage";
import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";

const CALENDAR_LABEL = 'My Calendar';

export default class FestivalScreeningPage {
  constructor() {
    cy.get('festival-screening', {timeout: 1000});
    cy.wait(1000);
  }

  assertScreeningsExists(screeningNames: string[]) {
    cy.wait(1000);
    cy.get('festival-screening event-screening-item', {timeout: 1000})
    .then($el => {
      screeningNames.forEach(screeningName => {
        cy.log(`assertScreeningsExists: {${screeningName}}!`);
        cy.wrap($el).contains(screeningName);
      })
    })
    /* .should('have.length', 4) */
    //.contains(screeningName);
  }

  /**
   * clickRequestInvitation - Click the action button
   *   Private Event : Invitation request is sent
   *   Public Event  : Event is added to user's calendar
   * @param screeningTitle : Title of event
   */
  clickRequestInvitation(screeningTitle: string) {
    cy.get('festival-screening event-screening-item', {timeout: 3000})
      .contains(screeningTitle)
      .parent().parent().parent()
      .find('button[test-id=invitation-request]').click();
    //cy.wait(3000);
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').click();
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

  /**
   * checkEventsInMarket - check if provided list of events are 
   *   existing
   * @param eventNames[] : list of screening event names to check 
   */
  checkEventsInMarket(eventNames: string[]) {
    eventNames.forEach(eventName => {
      cy.log(`checkEventsInMarket : article for {${eventName}}!`);
      let pageFestivalMarketplaceEvent = this.clickSpecificEvent(eventName);
      cy.wait(3000);
      pageFestivalMarketplaceEvent.assertEventNameExist(eventName);
      //pageFestivalMarketplaceEvent.clickBackToEventList();
      cy.go('back');
    })
  }
}
