import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  get,
  getByClass,
  getInList,
  check,
  uncheck,
  // cypress specific functions
  createFutureSlot,
  getCurrentWeekDays,
  // cypress specific interface
  EventSlot,
} from '@blockframes/testing/cypress/browser';
import { Organization, User, Movie, EventTypes } from '@blockframes/model';
import { user, org, permissions, movie1, movie2 } from '../../fixtures/dashboard/create-event';

const injectedData = {
  [`users/${user.uid}`]: user,
  [`orgs/${org.id}`]: org,
  [`permissions/${org.id}`]: permissions,
  [`movies/${movie1.id}`]: movie1,
  [`movies/${movie2.id}`]: movie2,
};

describe('Screenings', () => {
  beforeEach(() => {
    cy.visit('');
    firestore.clearTestData();
    adminAuth.deleteAllTestUsers();
    maintenance.start();
    firestore.create([injectedData]);
    maintenance.end();
    adminAuth.createUser({ uid: user.uid, email: user.email, emailVerified: true });
    browserAuth.clearBrowserAuth();
    cy.visit('');
    browserAuth.signinWithEmailAndPassword(user.email);
    cy.visit('');
    get('calendar').click();
  });

  it('adds a future public screening event', () => {
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${movie1.title.international}`;
    selectSlot(futureSlot);
    get('event-type').click();
    getInList('type_', 'Screening');
    get('event-title-modal').clear().type(eventTitle);
    get('more-details').click();
    get('warning-chip').should('exist');
    get('title').click();
    getInList('title_', movie1.title.international);
    get('description').type(`Description : ${eventTitle}`);
    get('public').click();
    get('event-save').should('be.enabled');
    get('event-save').click();
    get('event-save-disabled').should('be.disabled');
    get('arrow-back').click();
    getEventSlot(futureSlot).should('contain', movie1.title.international);
  });
});

function selectSlot(time: EventSlot) {
  const { day, hours, minutes } = time;
  return cy
    .get('.cal-day-column')
    .eq(day)
    .find('.cal-hour')
    .eq(hours)
    .children()
    .eq(!minutes ? 0 : 1)
    .click();
}

function getEventSlot(time: EventSlot) {
  const { day, hours, minutes } = time;
  //30 minutes are 30px high, an hour 60px
  let topOffset = hours * 60;
  if (minutes === 30) topOffset += 30;
  return cy.get('.cal-day-column').eq(day).find('.cal-events-container').find(`[style^="top: ${topOffset}px"]`);
}
