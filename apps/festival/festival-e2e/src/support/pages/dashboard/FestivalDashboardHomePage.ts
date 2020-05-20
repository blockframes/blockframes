import EventPage from './EventPage';
import FestivalInvitationsPage from './FestivalInvitationsPage';
import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard-home', { timeout: 30000 })
  }

  goToCalendar() {
    cy.get('festival-dashboard-home').get('a[test-id=calendar]').click();
    return new EventPage();
  }

  logout() {
    cy.get('auth-widget button[test-id=auth-user-avatar]').click().get('button[test-id=auth-logout]').click();
  }

  clickOnInvitations() {
    cy.get('festival-dashboard a[test-id=invitations-link]').click();
    return new FestivalInvitationsPage();
  }

  goToNotifications() {
    cy.visit('/c/o/dashboard/notifications');
    return new FestivalMarketplaceNotifications()
  }
}
