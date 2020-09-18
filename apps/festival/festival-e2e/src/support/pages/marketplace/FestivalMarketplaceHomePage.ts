
import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';
import FestivalOrganizationListPage from './FestivalOrganizationListPage';
import FestivalMarketplaceNotifications from './FestivalMarketplaceNotificationsPage';
import FestivalInvitationsPage from '../dashboard/FestivalInvitationsPage';
import EventPage from '../dashboard/EventPage';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home', { timeout: 30000 });
  }

  goToDashboard() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 500}).click();
    return new FestivalDashboardHomePage();
  }

  goToCalendar() {
    this.clickOnMenu();
    //Select Dashboard menu item
    cy.get('aside a[routerlink="/c/o/dashboard/home"]', {timeout: 500}).click();
    //cy.wait(2000);
    //this.clickOnMenu();
    cy.get('aside a[routerlink="event"]', {timeout: 5000}).click();
    return new EventPage();
  }  

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').click();
  }

  selectSalesAgents() {
    cy.get('layout-marketplace a').contains('Sales Agents').click();
    return new FestivalOrganizationListPage();
  }

  goToInvitations() {
    cy.get('app-bar a[test-id=invitations-link]').click();
    return new FestivalInvitationsPage()
  }

  goToNotifications() {
    cy.get('app-bar a[test-id=notifications-link]').click();
    return new FestivalMarketplaceNotifications();
  }
}
