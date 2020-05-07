export default class EventPage {
  constructor() {
    cy.get('festival-event-calendar');
  }
  createNewEvent(date: Date, title: string, type: 'screening' | 'meeting', privateEvent: boolean, allDay: boolean, moreDetail?: boolean) {

  }
}