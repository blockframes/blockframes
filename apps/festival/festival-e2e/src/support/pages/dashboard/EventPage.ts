import EventEditPage from './EventEditPage';
import { getTomorrowDay } from '@blockframes/e2e/utils/functions';

export default class EventPage {
  constructor() {
    //cy.get('festival-event-list');
    cy.get('cal-week');
  }

  createEvent(eventTitle: string, eventDate: Date, 
              screeningName: string, isPublic: boolean = false) {
    //TODO: refactor this to within Dashboard home
    cy.get('a[test-id="calendar"]').then($menu => {
      if ($menu.length) {
        cy.wrap($menu).click();
      } else {
        cy.get('button[test-id=menu]').click();
        cy.get('a[test-id="calendar"]').click();
      }
      cy.wait(1000);
      cy.get('button[test-id="menu"]', {timeout: 1200}).first().click();
      const event: EventEditPage = this.createDetailedEvent(eventDate);
      event.addEventTitle(eventTitle);
      event.selectMovie(screeningName);
      if (isPublic) {
        event.uncheckPrivate();
      }
      event.saveEvent();
      cy.get('[svgicon="arrow_back"]').click();
    });
  }

  createDetailedEvent(date: Date) {
    const day = getTomorrowDay(date);
    cy.get('div [class=cal-day-columns]').children().eq(day).find('mwl-calendar-week-view-hour-segment').first().click();
    cy.get('button[test-id=more-details]').click();
    return new EventEditPage();
  }

  createDetailedEventToday(date: Date) {
    cy.get('div [class=cal-day-columns]').children().eq(date.getDay()).find('mwl-calendar-week-view-hour-segment').first().click();
    cy.get('button[test-id=more-details]').click();
    return new EventEditPage();
  }
}
