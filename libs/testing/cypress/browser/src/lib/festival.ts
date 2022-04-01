// * SELLER
export function createEvent(eventDate: Date, eventType = 'Screening', eventTitle = '') {
  cy.log(`createEvent : {${eventTitle}}`);
  cy.log(`#Creating event type: [${eventType}] on <${eventDate.toLocaleDateString()}> :> ${eventTitle}`);

  const day = eventDate.getDay();
  // if (day === 0) cy.get('button[test-id=arrow_forward]').click();

  cy.get('div [class=cal-day-columns]').children().eq(day).find('mwl-calendar-week-view-hour-segment').first().click();

  cy.get('mat-select[test-id="event-type"]').first().click();

  cy.get('mat-option').contains(eventType).click();

  //Input the title string
  cy.get('input[test-id="event-title-modal"]').click().clear().type(eventTitle);

  cy.get('button[test-id=more-details]').click();

  cy.get('event-details-edit'); // * Waits for event details page to open
}

export function fillEventDetails(screeningName: string, isPublic = false, inviteeEmailList: string[] = []) {
  if (inviteeEmailList.length > 0) {
    inviteUser(inviteeEmailList);
    // We need to wait to fetch the invited user
    copyGuests(inviteeEmailList.length);
  }

  inputDescription(`Screening: ${screeningName}`);

  checkAllDay();
  uncheckPrivate(isPublic);

  selectMovie(screeningName);

  inputDescription(`Screening: ${screeningName}`);

  cy.log('Save event and navigate to calendar');
  saveEvent();
  cy.get('[svgicon="arrow_back"]').click();
}

export function inviteUser(email: string | string[]) {
  cy.contains('Invitations').click();
  if (Array.isArray(email)) {
    let index = 0;
    while (index < email.length) {
      cy.get('input#mat-chip-list-input-0').type(email[index]).type('{enter}');
      index++;
    }
  } else {
    cy.get('input#mat-chip-list-input-0').type(email).type('{enter}');
  }
  cy.wait(8000); // * I hate to do this, but this one's unavoidable as we cannot detect when the send invite button is ready
  cy.get('.invitations button[test-id=event-invite]').click();
}

export function copyGuests(expectedNumGuests: number) {
  cy.contains(`${expectedNumGuests} Guests`);
  cy.get('button[test-id=invitation-copy]').click();
}

export function inputDescription(description: string) {
  cy.get('[ng-reflect-router-link="screening"]').click();
  //Input description
  cy.get('textarea[formControlName="description"]').click().clear().type(description);
}

/**
 * Sets if event is full day.
 */
export function checkAllDay(fullDay = true) {
  if (fullDay) {
    cy.get('[test-id=all-day] input').check({ force: true }); // * We force these because the input isn't visible in Material checkboxes
  } else {
    cy.get('[test-id=all-day] input').uncheck({ force: true });
  }
}

/**
 * set event access
 */
export function uncheckPrivate(isPublic = false) {
  if (!isPublic) {
    //last radio button correspond to "private" privacy status
    cy.get('event-shell [type="radio"]').eq(2).check({ force: true });
  } else {
    //first radio button correspond to "public" privacy status
    cy.get('event-shell [type="radio"]').first().check({ force: true });
  }
}

export function selectMovie(movieName: string) {
  cy.get('event-shell mat-select[formControlName=titleId]').click();
  cy.get('mat-option').contains(movieName).click();
}

export function saveEvent() {
  cy.get('button[test-id=event-save]').click();
}

// Org admin

// * BUYER

export function acceptInvitationScreening() {
  cy.get('[test-id="invitation-accept"]').click();
  cy.wait(5000);
}

export function openMoreMenu() {
  cy.get('invitation-view [test-id=more]').first().click();
}

export function clickGoToEvent() {
  cy.get('[test-id=go-to-event]').click({ force: true });
}

// * Marketplace screening page

export function clickPlay() {
  cy.log('>FestivalMarketplaceScreeningPage: Start Play [test-id=play]');
  cy.get('[test-id=play]').click();
}

export function runVideo() {
  cy.log('>FestivalMarketplaceScreeningPage: Play video');
  cy.get('festival-event-session video').click({ force: true });
}

export function goToInvitations() {
  cy.get('app-bar a[test-id=invitations-link]').click();
}

export function refuseInvitationScreening() {
  cy.get('invitation-view [test-id=more]').first().click();
  cy.get('[test-id=decline-invitation]').click();
}

export function verifyNotification(message: string, accepted: boolean) {
  const notification = accepted ? 'accepted' : 'declined';
  cy.get('notification-item p[test-id=notification-message]').contains(message).contains(notification);
}

export function selectSalesAgents() {
  cy.get('layout-marketplace a[test-id=sellers]').click();
}
export function clickOnOrganization(orgName: string) {
  cy.get('festival-organization-list org-card').contains(orgName).parent().parent().find('a').click();
}

const NAV_SCREENING = 'Screening Schedule';

export function clickOnScreeningSchedule() {
  cy.get('festival-marketplace-organization-view a').contains(NAV_SCREENING).click();
}

export function clickPrivateEvent() {
  cy.log('Wait for events to load');
  cy.get('[test-id="screening-spinner"]').should('not.exist');

  cy.get('festival-screening event-screening-item h3').first().click();
}
export function assertJoinScreeningNotExists() {
  cy.log(`assertJoinScreeningNotExists : join screen should not exist!`);
  cy.get('festival-event-view a[test-id=event-room]').should('have.length', 0);
}
