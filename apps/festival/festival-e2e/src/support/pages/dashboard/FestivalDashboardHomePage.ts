import EventPage from './EventPage';
import EventDetailsEditPage from './EventDetailsEditPage';
import FestivalInvitationsPage from './FestivalInvitationsPage';
import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';
import { SEC } from '@blockframes/e2e/utils';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard', { timeout: 60 * SEC });
  }

  goToMarket() {
    cy.get('a[href="/c/o/marketplace/home"]', { timeout: 3 * SEC }).click();
  }

  goToCalendar() {
    cy.get('festival-dashboard a[test-id=calendar]', { timeout: 3 * SEC }).click();
    //return new EventPage();
  }

  logout() {
    cy.get('auth-widget button[test-id=auth-user]')
      .click()
      .get('button[test-id=auth-logout]')
      .click();
  }

  clickOnInvitations() {
    cy.get('festival-dashboard a[test-id=invitations-link]', { timeout: 3 * SEC }).click();
    return new FestivalInvitationsPage();
  }

  goToNotifications() {
    cy.get('festival-dashboard a[test-id=notifications-link]', {
      timeout: 3 * SEC,
    }).click();
    return new FestivalMarketplaceNotifications();
  }

  createEvent(
    eventTitle: string,
    eventDate: Date,
    screeningName: string,
    isPublic: boolean = false
  ) {
    const eventPage: EventPage = new EventPage();
    cy.get('a[test-id="calendar"]', { timeout: 3 * SEC }).then(($menu) => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]', { timeout: 3 * SEC }).first().click();
        cy.get('a[test-id="calendar"]', { timeout: 3 * SEC }).click();
      }
      cy.wait(1 * SEC);
      cy.get('button[test-id="menu"]', { timeout: 3 * SEC }).first().click();
      const event: EventDetailsEditPage = eventPage.createDetailedEvent(eventDate);
      event.addEventTitle(eventTitle);
      event.selectMovie(screeningName);
      event.uncheckPrivate(isPublic);
      event.saveEvent();
    });
  }
}
