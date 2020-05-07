import EventEditPage from './EventEditPage';
import { formatAmPm } from '@blockframes/utils/helpers';

export default class EventPage {
  constructor() {
    cy.get('festival-event-list');
  }
  createDetailedEvent(date: Date) {
    const hour = formatAmPm(date);
    cy.get('div').contains(hour).click();
    cy.get('button[test-id=more-details]').click();
    return new EventEditPage();

  }
}