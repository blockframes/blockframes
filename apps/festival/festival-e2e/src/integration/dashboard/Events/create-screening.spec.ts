import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  get,
  check,
  // cypress dashboard specific cpmmands
  connectOtherUser,
  interceptEmail,
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
import { Event, EventTypes, AccessibilityTypes, Invitation, displayName } from '@blockframes/model';
import { startOfWeek, add, isFuture } from 'date-fns';
import { capitalize } from '@blockframes/utils/helpers';

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
    adminAuth.deleteAllTestUsers();
    firestore.create([injectedData]);
    adminAuth.createUser({ uid: dashboardUser.uid, email: dashboardUser.email, emailVerified: true });
    adminAuth.createUser({ uid: marketplaceUser.uid, email: marketplaceUser.email, emailVerified: true });
    maintenance.end();
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(dashboardUser.email);
    cy.visit('');
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
    connectOtherUser(marketplaceUser.email);
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
    connectOtherUser(marketplaceUser.email);
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
    connectOtherUser(marketplaceUser.email);
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
    connectOtherUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: dummyEvent.title, accessibility: 'public', expected: true });
    verifyScreening({ title: eventTitle, accessibility: 'public', expected: false });
  });

  it.only('create today all day screening that invitee can attend', () => {
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
    connectOtherUser(marketplaceUser.email);
    get('event-link').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'private', expected: true });
    get('invitation-accept').click();
    get('invitation-status').should('contain', 'Invitation Accepted');
    get('ongoing-screening').click();
    get('event-room').click();
    get('play').click();
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
  }
  get(`invitation_${marketplaceUser.uid}`).should('contain', `${displayName(marketplaceUser)} (${marketplaceOrg.name})`);
}

function checkInvitationEmail(eventTitle: string, invitee: string) {
  return interceptEmail({ sentTo: invitee }).then(mail => {
    expect(mail.subject).to.eq(`You were invited to ${eventTitle} on Archipel Market`);
    const invitationLink = mail.html.links.filter(link => link.text === 'Answer Invitation')[0];
    cy.request({ url: invitationLink.href, failOnStatusCode: false }).then(response => {
      expect(response.redirects).to.have.lengthOf(1);
      const redirect = response.redirects[0];
      expect(redirect).to.include('302');
      getDbEvent(eventTitle).then(([event]) => {
        firestore
          .queryData<Invitation>({ collection: 'invitations', field: 'eventId', operator: '==', value: event.id })
          .then(invitations => {
            expect(redirect).to.include(`/event/${event.id}/r/i?email=${invitee.replace('@', '%40')}&i=${invitations[0].id}`);
          });
      });
    });
  });
}

function verifyScreening({ title, accessibility, expected }: ScreeningVerification) {
  return getDbEvent(title).then(([dbEvent]) => {
    get(`event_${dbEvent.id}`).should(expected ? 'exist' : 'not.exist');
    if (expected) get(`event_${dbEvent.id}`).should('contain', `${capitalize(accessibility)} Screening`);
  });
}

function getDbEvent(eventTitle: string) {
  return firestore.queryData<Event>({ collection: 'events', field: 'title', operator: '==', value: eventTitle });
}
