import EventDetailsEditPage from './EventDetailsEditPage';
import { SEC } from '@blockframes/e2e/utils';

export default class EventPage {

  checkCalendarView() {
    cy.get('cal-week', {timeout: 30 * SEC});
  }

  waitNewUrl() {
    return new Cypress.Promise(resolve => {
      cy.on('url:changed', (url) => {
        resolve(url);
      })
    })
  }

  /**
   * createEvent : Creates a screening event & saves the details.
   * Note: Only events that have movies uploaded are available for viewing
   * 
   * @param eventName : Screening Event Title (Listed on Calendar)
   * @param screeningName : Title screened (what is shown)
   * @param isPublic  : true for public event, false for private
   */  
  createEventDetails2(screeningName: string, isPublic: boolean = false, inviteeList:string[] = [], ) {
    cy.log(`CreateEvent details for screening : {${screeningName}}`);
    const event: EventDetailsEditPage = new EventDetailsEditPage();

    if (inviteeList.length !== 0) {
      event.inviteUser(inviteeList);
      // We need to wait to fetch the invited user
      event.copyGuests();
      cy.wait(8 * SEC);
    }

    event.inputDescription(`Screening: ${screeningName}`);
    event.checkAllDay();
    event.uncheckPrivate(isPublic);
    event.selectMovie(screeningName);
    event.inputDescription(`Screening: ${screeningName}`);
    cy.log('Save event and navigate to calendar');
    event.saveEvent();
    cy.get('[svgicon="arrow_back"]').click();
    cy.wait(1 * SEC);
  }

  /**
   * createEvent : Creates a screening event & saves the details.
   * Note: Only events that have movies uploaded are available for viewing
   * 
   * @param date  : Date of screening
   * @param eventName : Screening Event Name (Listed on Calendar)
   * @param eventType : type - Screening (default)/ Meeting
   * mwl-calendar-week-view .cal-time-events
   */  
  createEvent(date: Date, eventName: string = '', eventType: string = 'Screening') {
    cy.log(`#Creating event type: [${eventType}] on <${date.toLocaleDateString()}> :> ${eventName}`)
    const day = date.getDay();
    if (day === 0) {
      cy.get('button[test-id=arrow_forward]', {timeout: 3 * SEC})
        .click();
      cy.wait(1 * SEC);
    }
    cy.get('div [class="cal-day-columns"]', {timeout: 3 * SEC}).last().children().eq(day)
      .find('mwl-calendar-week-view-hour-segment').first()
      .click({force: true});
    cy.wait(0.5 * SEC);
    cy.get('mat-select[test-id="event-type"]', {timeout: 3 * SEC})
      .first()
      .click({force: true});
    cy.wait(1 * SEC);
    cy.get('mat-option', {timeout: 3 * SEC})
      .contains(eventType, {timeout: 3 * SEC}).click({force: true});
    cy.wait(1 * SEC);

    //Input the event name
    cy.get('input[test-id="event-title-modal"]', {timeout: 1 * SEC})
      .click({force: true})
      .clear()
      .type(eventName);

    cy.get('button[test-id=more-details]', {timeout: 1 * SEC})
      .click();
    cy.wait(0.5 * SEC);
  }

}
