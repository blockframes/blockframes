﻿import EventEditPage from './EventEditPage';
import { SEC } from '@blockframes/e2e/utils';

export default class EventPage {
  constructor() {
    //cy.get('festival-event-list');
    cy.get('cal-week');
  }

  waitNewUrl() {
    return new Cypress.Promise((resolve, reject) => {
      cy.on('url:changed', (url) => {
        resolve(url);
      })
    })
  }

  /**
   * createEvent : Creates a screening event & saves the details.
   * Note: Only events that have movies uploaded are available for viewing
   * 
   * @param eventTitle : Screening Event Title (Listed on Calendar)
   * @param eventDate  : Date of screening
   * @param screeningName : Title screened (what is shown)
   * @param isPublic  : true for public event, false for private
   */
  createEvent(eventTitle: string, eventDate: Date, 
              screeningName: string, isPublic: boolean = false) {
    cy.log(`createEvent : {${eventTitle}}`);
    const event: EventEditPage = this.createDetailedEvent(eventDate, 'Screening', eventTitle);
    event.uncheckPrivate(isPublic);

    event.selectMovie(screeningName);

    event.saveEvent();
    cy.get('[svgicon="arrow_back"]').click();
  }

  createDetailedEvent(date: Date, eventType: string = 'Screening', title: string = '') {
    cy.log(`#Creating event type: [${eventType}] on <${date.toLocaleDateString()}> :> ${title}`)
    const day = date.getDay();
    if (day === 0) {
      cy.get('button[test-id=arrow_forward]', {timeout: 3 * SEC})
        .click();
      cy.wait(1 * SEC);
    }
    cy.get('div [class=cal-day-columns]').children().eq(day)
      .find('mwl-calendar-week-view-hour-segment').first()
      .click();
    cy.get('mat-select[test-id="event-type"]', {timeout: 3 * SEC})
      .first()
      .click({force: true});
    cy.get('mat-option', {timeout: 3 * SEC})
      .contains(eventType).click({force: true});
    
    //Input the title string
    cy.get('input[test-id="event-title"]', {timeout: 1 * SEC})
      .click({force: true})
      .clear()
      .type(title);

    cy.get('button[test-id=more-details]')
      .click();
    return new EventEditPage();
  }

}
