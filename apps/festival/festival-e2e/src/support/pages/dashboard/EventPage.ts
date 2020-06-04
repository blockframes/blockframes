import EventEditPage from './EventEditPage';
import { getTomorrowDay } from '@blockframes/e2e/utils/functions';

export default class EventPage {
  constructor() {
    cy.get('festival-event-list');
  }
  createDetailedEvent(date: Date) {
    const day = getTomorrowDay(date);
    cy.get('div [class=cal-day-columns]').children().eq(day).find('mwl-calendar-week-view-hour-segment').first().click();
    cy.get('button[test-id=more-details]').click();
    return new EventEditPage();
  }
}
