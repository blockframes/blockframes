//import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';

import MovieMainPage from "./MovieMainPage";

//const BUTTON_START = 'Begin';

export default class MovieTunnelStartPage {
  constructor() {
    //cy.get('[test-id="menu"]', { timeout: 30000 }).click();
  }

  public clickBegin() {
    cy.get('button[test-id=begin]')
      .click();
    return new MovieMainPage();
  }
}
