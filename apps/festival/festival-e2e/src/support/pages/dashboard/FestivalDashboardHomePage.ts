import EventPage from './EventPage';
import EventEditPage from './EventEditPage';
import FestivalInvitationsPage from './FestivalInvitationsPage';
import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard-home', { timeout: 30000 })
  }

  goToMarket() {
    cy.get('a[href="/c/o/marketplace/home"]').click();
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

  createEvent(eventTitle: string, eventDate: Date, 
              screeningName: string, isPublic: boolean = false) {
    const eventPage: EventPage = new EventPage();
    cy.get('a[test-id="calendar"]').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]').click();
        cy.get('a[test-id="calendar"]').click();
      }
      cy.wait(1000);
      cy.get('button[test-id="menu"]', {timeout: 1200}).first().click();
      const event: EventEditPage = eventPage.createDetailedEvent(eventDate);
      event.addEventTitle(eventTitle);
      event.selectMovie(screeningName);
      if (isPublic) {
        event.uncheckPrivate();
      }
      event.saveEvent();
    });
  }
}
