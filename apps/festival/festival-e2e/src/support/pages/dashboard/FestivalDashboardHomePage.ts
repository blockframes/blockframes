import EventPage from './EventPage';
import FestivalInvitationsPage from './FestivalInvitationsPage';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard-home')
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
}
