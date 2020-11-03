
import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';
import FestivalOrganizationListPage from './FestivalOrganizationListPage';
import FestivalMarketplaceNotifications from './FestivalMarketplaceNotificationsPage';
import FestivalInvitationsPage from '../dashboard/FestivalInvitationsPage';
import EventPage from '../dashboard/EventPage';
import { TO } from '@blockframes/e2e/utils';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home', { timeout: TO.PAGE_LOAD });
  }

  goToDashboard() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 500})
      .click();
    return new FestivalDashboardHomePage();
  }

  goToCalendar() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 500}).click();
    cy.get('aside a[routerlink="event"]', {timeout: 5000}).click();
    return new EventPage();
  }  

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]', {timeout: 1000})
      .first().click();
  }

  selectSalesAgents() {
    cy.get('layout-marketplace a', { timeout: TO.PAGE_ELEMENT })
      .contains('Sales Agents').click();
    return new FestivalOrganizationListPage();
  }

  goToInvitations() {
    cy.get('app-bar a[test-id=invitations-link]', { timeout: TO.PAGE_ELEMENT }).click();
    return new FestivalInvitationsPage();
  }

  goToNotifications() {
    cy.get('app-bar a[test-id=notifications-link]', { timeout: TO.PAGE_ELEMENT }).click();
    return new FestivalMarketplaceNotifications();
  }
}
