import { EventEditPage } from '.';
import { formatAmPm } from '@blockframes/e2e/utils/functions';

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