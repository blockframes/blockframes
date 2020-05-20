
import FestivalDashboardHomePage from '../dashboard/FestivalDashboardHomePage';
import FestivalOrganizationListPage from './FestivalOrganizationListPage';
import FestivalMarketplaceNotifications from './FestivalMarketplaceNotificationsPage';
import FestivalInvitationsPage from '../dashboard/FestivalInvitationsPage';

export default class FestivalMarketplaceHomePage {
  constructor() {
    cy.get('festival-marketplace-home', { timeout: 30000 });
  }

  goToDashboard() {
    cy.visit('/c/o/dashboard')
    return new FestivalDashboardHomePage();
  }

  clickOnMenu() {
    cy.get('festival-marketplace button[test-id=menu]').click();
  }

  selectSalesAgents() {
    cy.get('layout-marketplace a').contains('Sales Agents').click();
    return new FestivalOrganizationListPage();
  }
  goToNotifications() {
    cy.visit('/c/o/marketplace/notifications');
    return new FestivalMarketplaceNotifications()
  }

  goToInvitations() {
    cy.get('app-bar a[test-id=invitations-link]').click();
    return new FestivalInvitationsPage()
  }
}
