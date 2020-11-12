import EventPage from './EventPage';
import EventEditPage from './EventEditPage';
import FestivalInvitationsPage from './FestivalInvitationsPage';
import FestivalMarketplaceNotifications from '../marketplace/FestivalMarketplaceNotificationsPage';
import { TO } from '@blockframes/e2e/utils';

export default class FestivalDashboardHomePage {
  constructor() {
    cy.get('festival-dashboard', { timeout: TO.PAGE_LOAD })
  }

  goToMarket() {
    cy.get('a[href="/c/o/marketplace/home"]', { timeout: TO.PAGE_ELEMENT })
      .click();
  }

  goToCalendar() {
    cy.get('festival-dashboard a[test-id=calendar]', { timeout: TO.PAGE_ELEMENT })
      .click();
    return new EventPage();
  }

  logout() {
    cy.get('auth-widget button[test-id=auth-user-avatar]').click().get('button[test-id=auth-logout]').click();
  }

  clickOnInvitations() {
    cy.get('festival-dashboard a[test-id=invitations-link]', {timeout: TO.PAGE_ELEMENT})
      .click();
    return new FestivalInvitationsPage();
  }

  goToNotifications() {
    cy.get('festival-dashboard a[test-id=notifications-link]', {timeout: TO.PAGE_ELEMENT})
    .click();
    return new FestivalMarketplaceNotifications()
  }

  createEvent(eventTitle: string, eventDate: Date, 
              screeningName: string, isPublic: boolean = false) {
    const eventPage: EventPage = new EventPage();
    cy.get('a[test-id="calendar"]', { timeout: TO.PAGE_ELEMENT }).then($menu => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]', {timeout: TO.PAGE_ELEMENT})
          .first().click();
        cy.get('a[test-id="calendar"]', {timeout: TO.PAGE_ELEMENT})
          .click();
      }
      cy.wait(TO.WAIT_1SEC);
      cy.get('button[test-id="menu"]', {timeout: TO.PAGE_ELEMENT})
        .first().click();
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
