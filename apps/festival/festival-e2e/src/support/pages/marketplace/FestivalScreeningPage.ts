import FestivalMarketplaceCalendarPage from "./FestivalMarketplaceCalendarPage";
import FestivalMarketplaceEventPage from "./FestivalMarketplaceEventPage";
import { SEC } from "@blockframes/e2e/utils";

const CALENDAR_LABEL = 'My Calendar';

export default class FestivalScreeningPage {
  constructor() {
    cy.waitUntil(() => cy.get('festival-screening'));
  }

  assertScreeningsExists(screeningNames: string[]) {
    cy.get('festival-screening event-screening-item', {timeout: 30 * SEC})
    .then($el => {
      screeningNames.forEach(screeningName => {
        cy.log(`assertScreeningsExists: {${screeningName}}!`);
        cy.wrap($el).contains(screeningName);
      })
    })
  }

  /**
   * clickRequestInvitation - Click the action button
   *   Private Event : Invitation request is sent
   *   Public Event  : Event is added to user's calendar
   * @param screeningTitle : Title of event
   */
  clickRequestInvitation(screeningTitle: string) {
    cy.get('festival-screening event-screening-item', {timeout: 30 * SEC})
      .contains(screeningTitle)
      .parent().parent().parent()
      .find('button[test-id=invitation-request]').click();
    cy.wait(1 * SEC);
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]', {timeout: 3 * SEC})
      .click();
  }

  selectCalendar() {
    cy.get('layout-marketplace a').contains(CALENDAR_LABEL).click();
    return new FestivalMarketplaceCalendarPage();
  }

  clickPrivateEvent() {
    cy.get('festival-screening event-screening-item h3').first().click();
    return new FestivalMarketplaceEventPage();
  }

  clickSpecificEvent(eventName: string, navigateToEvent: boolean = false) {
    //TODO: check : festival-screening event-screening-item h3
    if (!navigateToEvent) {
      cy.get('article h3', {timeout: 30 * SEC})
        .contains(eventName);
    } else {
      cy.get('article h3', {timeout: 30 * SEC})
        .contains(eventName).click();
      
      return new FestivalMarketplaceEventPage();
    }
  }

  /**
   * checkEventsInMarket - check if provided list of events are 
   *   existing
   * @param eventNames[] : list of screening event names to check 
   */
  checkEventsInMarket(eventNames: string[]) {
    eventNames.forEach(eventName => {
      cy.log(`checkEventsInMarket : article for {${eventName}}!`);
      this.clickSpecificEvent(eventName);
      //pageFestivalMarketplaceEvent.clickBackToEventList();
      //cy.go('back');
    });

    const pageFestivalMarketplaceEvent = 
                    this.clickSpecificEvent(eventNames[0], true);
    cy.wait(3000);
    pageFestivalMarketplaceEvent.assertEventNameExist(eventNames[0]);
  }
}
