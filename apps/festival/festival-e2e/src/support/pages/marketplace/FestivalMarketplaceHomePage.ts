
import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';
import FestivalOrganizationListPage from './FestivalOrganizationListPage';
import FestivalMarketplaceNotifications from './FestivalMarketplaceNotificationsPage';
import FestivalInvitationsPage from '../dashboard/FestivalInvitationsPage';
import EventPage from '../dashboard/EventPage';
import { SEC } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home', { timeout: 60 * SEC });
  }

  goToDashboard() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 0.5 * SEC})
      .click();
    return new FestivalDashboardHomePage();
  }

  goToCalendar() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 0.5 * SEC}).click();
    cy.get('aside a[routerlink="event"]', {timeout: 5 * SEC}).click();
    return new EventPage();
  }  

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]', {timeout: 3 * SEC})
      .first().click();
  }

  selectSalesAgents() {
    cy.get('layout-marketplace a', { timeout: 3 * SEC })
      .contains('Sales Agents').click();
    return new FestivalOrganizationListPage();
  }

  goToInvitations() {
    cy.get('app-bar a[test-id=invitations-link]', { timeout: 3 * SEC }).click();
    return new FestivalInvitationsPage();
  }

  goToNotifications() {
    cy.get('app-bar a[test-id=notifications-link]', { timeout: 3 * SEC }).click();
    return new FestivalMarketplaceNotifications();
  }
}
