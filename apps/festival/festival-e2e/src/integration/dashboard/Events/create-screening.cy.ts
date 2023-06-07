import {
  // plugins
  adminAuth,
  firestore,
  gmail,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  get,
  check,
  // cypress dashboard specific cpmmands
  connectUser,
  interceptEmail,
  getByClass,
  //helpers
  getTextBody,
  getBodyLinks,
  getSubject,
} from '@blockframes/testing/cypress/browser';
import {
  dashboardUser,
  marketplaceUser,
  dashboardOrg,
  marketplaceOrg,
  dashboardPermissions,
  marketplacePermissions,
  screenerMovie,
  noScreenerMovie,
  dashboardDocumentPermissions,
  dummyEvent,
} from '../../../fixtures/dashboard/create-event';
import {
  Event,
  EventTypes,
  AccessibilityTypes,
  Invitation,
  displayName,
  accessibility as accessibilityModel,
} from '@blockframes/model';
import { startOfWeek, add, isFuture } from 'date-fns';

const injectedData = {
  // dashboard user
  [`users/${dashboardUser.uid}`]: dashboardUser,
  [`orgs/${dashboardOrg.id}`]: dashboardOrg,
  [`permissions/${dashboardOrg.id}`]: dashboardPermissions,
  // marketplace user
  [`users/${marketplaceUser.uid}`]: marketplaceUser,
  [`orgs/${marketplaceOrg.id}`]: marketplaceOrg,
  [`permissions/${marketplaceOrg.id}`]: marketplacePermissions,
  // movies
  [`movies/${screenerMovie.id}`]: screenerMovie,
  [`movies/${noScreenerMovie.id}`]: noScreenerMovie,
  // events
  [`events/${dummyEvent.id}`]: dummyEvent,
  // document permissions
  [`permissions/${dashboardOrg.id}/documentPermissions/${dashboardDocumentPermissions.id}`]: dashboardDocumentPermissions,
};

describe('Screenings', () => {
  beforeEach(() => {
    cy.visit('');
    maintenance.start();
    firestore.clearTestData();
    firestore.queryDelete({ collection: 'events', field: 'ownerOrgId', operator: '==', value: dashboardOrg.id });
    firestore.queryDelete({ collection: 'invitations', field: 'toUser.uid', operator: '==', value: marketplaceUser.uid });
    firestore.queryDelete({
      collection: 'notifications',
      field: 'toUserId',
      operator: 'in',
      value: [dashboardUser.uid, marketplaceUser.uid],
    });
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: dashboardUser.uid, email: dashboardUser.email, emailVerified: true });
    adminAuth.createUser({ uid: marketplaceUser.uid, email: marketplaceUser.email, emailVerified: true });
    maintenance.end();
    connectUser(dashboardUser.email);
    get('calendar').click();
    get('cookies').click();
  });

  it('create future public screening event, check if visible in market place, testing also noScreener behaviour', () => {
    const screenerTitle = screenerMovie.title.international;
    const noScreenerTitle = noScreenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movieId: screenerMovie.id, eventTitle, accessibility: 'public' });
    get('event-save-disabled').should('be.disabled');
    get('missing-screener').should('not.exist');
    get('warning-screener').should('not.exist');
    // change movie to check noScreener behaviour
    get('screening-title').click();
    get(`option_${noScreenerMovie.id}`).click();
    get('event-save').click();
    get('warning-screener').should('exist');
    get('missing-screener').should('exist');
    get('arrow-back').click();
    getEventSlot(futureSlot).should('contain', noScreenerTitle);
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'public', expected: true });
  });

  it('create future private screening event and check if visible in market place', () => {
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin private screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movieId: screenerMovie.id, eventTitle, accessibility: 'private' });
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'private', expected: true });
  });

  it('create future protected screening event and check if visible in market place', () => {
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin protected screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movieId: screenerMovie.id, eventTitle, accessibility: 'protected' });
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'protected', expected: true });
  });

  it('create future secret public screening event and check if visible in market place', () => {
    // create event
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movieId: screenerMovie.id, eventTitle, accessibility: 'public', secret: true });
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: dummyEvent.title, accessibility: 'public', expected: true });
    verifyScreening({ title: eventTitle, accessibility: 'public', expected: false });
  });

  it('create today all day screening that willing invitee can attend', () => {
    const screenerTitle = screenerMovie.title.international;
    const todaySlot: EventSlot = { day: new Date().getDay(), hours: 1, minutes: 0 };
    const eventTitle = `Admin private screening / all day - ${screenerTitle}`;
    // create event
    selectSlot(todaySlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle, allDay: true });
    fillDashboardCalendarDetails({
      movieId: screenerMovie.id,
      eventTitle,
      accessibility: 'private',
      invitee: marketplaceUser.email,
    });
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('invitations-link').click();
    get('invitation').should('have.length', 1).and('contain', `${dashboardOrg.name} invited you to ${eventTitle}`);
    get('invitation')
      .find('a')
      .then(links => {
        firestore
          .queryData<Event>({ collection: 'events', field: 'ownerOrgId', operator: '==', value: dashboardOrg.id })
          .then(events => {
            const [invitationEvent] = events.filter(e => e.id !== dummyEvent.id);
            expect(links[0].href).to.contain(`c/o/marketplace/organization/${dashboardOrg.id}`);
            expect(links[1].href).to.contain(`http://localhost:4200/event/${invitationEvent.id}/r/i/session`);
          });
      });
    get('invitation-accept').click();
    get('invitation-status').should('contain', 'Accepted');
    interceptEmail(`to:${dashboardUser.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.eq(
        `${marketplaceUser.firstName} ${marketplaceUser.lastName} accepted your invitation to ${eventTitle} on Archipel Market`
      );
      gmail.deleteEmail(mail.id);
    });
    cy.visit('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'private', expected: true });
    get('invitation-status').should('contain', 'Invitation Accepted');
    get('ongoing-screening').click();
    get('event-room').click();
    get('play').click();
    get('festival-spinner').should('not.exist');
    get('viewer').click();
    getByClass('jw-video').should('exist');
    cy.wait(5000); // just to see in the e2e record if the video launched
  });

  it('create today all day screening that unwilling invitee cannot attend', () => {
    const screenerTitle = screenerMovie.title.international;
    const todaySlot: EventSlot = { day: new Date().getDay(), hours: 1, minutes: 0 };
    const eventTitle = `Admin private screening / all day - ${screenerTitle}`;
    // create event
    selectSlot(todaySlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle, allDay: true });
    fillDashboardCalendarDetails({
      movieId: screenerMovie.id,
      eventTitle,
      accessibility: 'private',
      invitee: marketplaceUser.email,
    });
    interceptEmail('subject:A new event has been created').then(mail => gmail.deleteEmail(mail.id));
    connectUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'private', expected: true });
    get('invitation-refuse').click();
    get('invitation-status').should('contain', 'Invitation Declined');
    /* decline mail takes around 4min to arrive for some reason => not testing it / issue #9253
    asked for support :  https://support.google.com/mail/thread/218582078?hl=en&sjid=3056270844623701063-EU

    interceptEmail(`to:${dashboardUser.email}`).then(mail => {
      const subject = getSubject(mail);
      expect(subject).to.eq(
        `${marketplaceUser.firstName} ${marketplaceUser.lastName} declined your invitation to ${eventTitle} on Archipel Market`
      );
      gmail.deleteEmail(mail.id);
    });
    */
    get('ongoing-screening').click();
    get('event-room').should('not.exist');
  });
});

//* Functions

interface EventSlot {
  day: number;
  hours: number;
  minutes: 0 | 30;
}

interface ScreeningVerification {
  title: string;
  accessibility: AccessibilityTypes;
  expected: boolean;
}

function createFutureSlot() {
  const slot: EventSlot = { day: 0, hours: 0, minutes: 0 };
  do {
    slot.day = new Date().getDay() + Math.floor(Math.random() * (7 - new Date().getDay()));
    slot.hours = Math.floor(Math.random() * 24);
    slot.minutes = Math.random() < 0.5 ? 0 : 30;
  } while (!isFuture(add(startOfWeek(new Date()), { days: slot.day, hours: slot.hours, minutes: slot.minutes })));
  return slot;
}

function selectSlot({ day, hours, minutes }: EventSlot) {
  return cy
    .get('.cal-day-column')
    .eq(day)
    .find('.cal-hour')
    .eq(hours)
    .children()
    .eq(!minutes ? 0 : 1)
    .click();
}

function getEventSlot({ day, hours, minutes }: EventSlot) {
  //30 minutes are 30px high, an hour 60px
  let topOffset = hours * 60;
  if (minutes === 30) topOffset += 30;
  return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
}

function fillDashboardCalendarPopin({ type, title, allDay }: { type: EventTypes; title: string; allDay?: boolean }) {
  get('event-type').click();
  get(`option_${type}`).click();
  if (allDay) get('all-day').click();
  get('event-title-modal').clear().type(title);
  get('more-details').click();
}

function fillDashboardCalendarDetails({
  movieId,
  eventTitle,
  accessibility,
  secret,
  invitee,
}: {
  movieId: string;
  eventTitle: string;
  accessibility: AccessibilityTypes;
  secret?: boolean;
  invitee?: string;
}) {
  get('screening-title').click();
  get(`option_${movieId}`).click();
  get('description').type(`Description : ${eventTitle}`);
  get(accessibility).click();
  if (secret) check('secret');
  if (invitee) {
    get('invitations').click();
    get('invite-guests').type(invitee);
    get('event-invite').click();
    checkInvitationEmail(eventTitle, invitee);
    get(`invitation_${marketplaceUser.uid}`).should('contain', `${displayName(marketplaceUser)} (${marketplaceOrg.name})`);
  } else {
    get('event-save').click();
  }
}

function checkInvitationEmail(eventTitle: string, invitee: string) {
  return interceptEmail(`to: ${invitee}`).then(mail => {
    const subject = getSubject(mail);
    expect(subject).to.eq(`You were invited to ${eventTitle} on Archipel Market`);
    const body = getTextBody(mail);
    const links = getBodyLinks(body);
    cy.request({ url: links['Invitation'], failOnStatusCode: false }).then(response => {
      expect(response.redirects).to.have.lengthOf(1);
      const redirect = response.redirects[0];
      getDbEvent(eventTitle).then(dbEvent => {
        firestore
          .queryData<Invitation>({ collection: 'invitations', field: 'eventId', operator: '==', value: dbEvent.id })
          .then(([invitation]) => {
            expect(redirect).to.include('302');
            expect(redirect).to.include(`/event/${dbEvent.id}/r/i?email=${encodeURIComponent(invitee)}&amp;i=${invitation.id}`);
          });
      });
    });
    gmail.deleteEmail(mail.id);
  });
}

function verifyScreening({ title, accessibility, expected }: ScreeningVerification) {
  return getDbEvent(title).then(dbEvent => {
    get(`event_${dbEvent.id}`).should(expected ? 'exist' : 'not.exist');
    if (expected) get(`event_${dbEvent.id}`).should('contain', `${accessibilityModel[accessibility]} Screening`);
  });
}

function getDbEvent(eventTitle: string) {
  return firestore
    .queryData<Event>({ collection: 'events', field: 'title', operator: '==', value: eventTitle })
    .then(([dbEvent]) => dbEvent);
}
