import FestivalMarketplaceCalendarPage from "./FestivalMarketplaceCalendarPage";

const PRIVATE = 'Private Screening';
const PUBLIC = 'Public Screening';
const CALENDAR_LABEL = 'My Calendar';

export default class FestivalScreeningPage {
  constructor() {
    cy.get('festival-screening');
  }

  assertScreeningsExists(screeningName: string) {
    cy.wait(1000);
    cy.get('festival-screening event-screening-item').should('have.length', 4).contains(screeningName);
  }

  clickAskForInvitation() {
    cy.get('festival-screening event-screening-item').contains(PRIVATE).first().parent().parent().find('button[test-id=invitation-request]').click();
    cy.wait(3000);
  }

  clickAddToCalendar() {
    cy.get('festival-screening event-screening-item').contains(PUBLIC).first().parent().parent().find('button[test-id=invitation-request]').click();
    cy.wait(3000);
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').click();
  }

  selectCalendar() {
    cy.get('layout-marketplace a').contains(CALENDAR_LABEL).click();
    return new FestivalMarketplaceCalendarPage();
  }
}
