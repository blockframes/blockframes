//import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';

const TITLE = 'Main Information';

export default class MovieMainPage {
  constructor() {
    cy.get('h1', { timeout: 10000 }).contains(TITLE);
  }

  public clickBegin() {
    cy.get('button[test-id=begin]')
      .click();
  }

  public fillInternationalTitle(title: string) {
    cy.get('input[test-id=international-title]').type(title);
  }  
}
