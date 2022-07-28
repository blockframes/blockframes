import { SEC } from '@blockframes/e2e/utils';
import {
  // plugins
  adminAuth,
  browserAuth,
  firestore,
  maintenance,
  // cypress commands
  assertUrlIncludes,
  get,
  getInList,
  // cypress dashboard specific cpmmands
  connectOtherUser,
  getEventSlot,
  selectSlot,
  fillDashboardCalendarPopin,
  fillDashboardCalendarDetails,
  verifyScreening,
  // cypress specific functions
  createFutureSlot,
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
} from '../fixtures/dashboard/create-event';

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
    console.log('*** BEFORE EACH START')
    maintenance.start().then(() => console.log('*** MAINTENANCE EN COURS'))

    return firestore.clearTestData()
      .then(() => firestore.deleteOrgEvents(dashboardOrg.id))
      .then(() => adminAuth.deleteAllTestUsers())
      .then(() => firestore.create([injectedData]))
      .then(() => adminAuth.createUser({ uid: dashboardUser.uid, email: dashboardUser.email, emailVerified: true }))
      .then(() => adminAuth.createUser({ uid: marketplaceUser.uid, email: marketplaceUser.email, emailVerified: true }))
      .then(() => maintenance.end())
      .then(() => browserAuth.clearBrowserAuth())
      .then(() => cy.visit(''))
      .then(() => browserAuth.signinWithEmailAndPassword(dashboardUser.email))
      .then(() => cy.visit(''))
      .then(() => get('calendar').click())
      .then(() => get('cookies').click());
  });

  it('create future public screening event, check if visible in market place, testing also noScreener behaviour', () => {
    cy.wait(10 * SEC);
    const screenerTitle = screenerMovie.title.international;
    const noScreenerTitle = noScreenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movie: screenerTitle, title: eventTitle, accessibility: 'public' });
    get('event-save-disabled').should('be.disabled');
    get('missing-screener').should('not.exist');
    //*warning chip changed in html, to be updated
    //get('warning-chip').should('not.exist');
    // change movie to check noScreener behaviour
    get('title').click();
    getInList('title_', noScreenerTitle);
    get('event-save').click();
    //*warning chip changed in html, to be updated
    //get('warning-chip').should('exist');
    get('missing-screener').should('exist');
    get('arrow-back').click();
    getEventSlot(futureSlot).should('contain', noScreenerTitle);
    connectOtherUser(marketplaceUser.email);
    get('skip-preferences').click();
    get('screenings').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'public', expected: true });
  });

  it('create future private screening event and check if visible in market place', () => {
    cy.wait(10 * SEC);
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin private screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movie: screenerTitle, title: eventTitle, accessibility: 'private' });
    connectOtherUser(marketplaceUser.email);
    get('skip-preferences').click();
    get('screenings').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'private', expected: true });
  });

  it('create future protected screening event and check if visible in market place', () => {
    cy.wait(10 * SEC);
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin protected screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    // create event
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movie: screenerTitle, title: eventTitle, accessibility: 'protected' });
    connectOtherUser(marketplaceUser.email);
    get('skip-preferences').click();
    get('screenings').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: eventTitle, accessibility: 'protected', expected: true });
  });

  it('create future secret public screening event and check if visible in market place', () => {
    cy.wait(10 * SEC);
    // create event
    const screenerTitle = screenerMovie.title.international;
    const futureSlot = createFutureSlot();
    const eventTitle = `Admin public screening / d${futureSlot.day}, h${futureSlot.hours}:${futureSlot.minutes} - ${screenerTitle}`;
    selectSlot(futureSlot);
    fillDashboardCalendarPopin({ type: 'screening', title: eventTitle });
    fillDashboardCalendarDetails({ movie: screenerTitle, title: eventTitle, accessibility: 'public', secret: true });
    connectOtherUser(marketplaceUser.email);
    get('skip-preferences').click();
    get('screenings').click();
    assertUrlIncludes('c/o/marketplace/event');
    verifyScreening({ title: dummyEvent.title, accessibility: 'public', expected: true });
    verifyScreening({ title: eventTitle, accessibility: 'public', expected: false });
  });
});
