import { getTwilioAccessToken, RequestAccessToken } from './twilio';
import { CallableContextOptions } from 'firebase-functions-test/lib/main';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { getTestingProjectId, initFunctionsTestMock, populate } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

const testInvitations = [
  {
    id: 'invit-A',
    type: 'attendEvent',
    eventId: 'eventTest',
    status: 'accepted',
    mode: 'invitation',
    toUser: { uid: 'uidUserTest' },
  },
  {
    id: 'invit-B',
    type: 'attendEvent',
    eventId: 'eventTestInvOnly',
    status: 'accepted',
    mode: 'invitation',
    toUser: { email: 'foo@bar.com' },
  }
];
const testEvents = [
  {
    id: 'eventTest',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' },
    ownerOrgId: 'idOrgTest',
    accessibility: 'private'
  },
  {
    id: 'eventTestInvOnly',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' },
    ownerOrgId: 'idOrgTest',
    accessibility: 'protected'
  },
  {
    id: 'eventTestPublic',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' },
    ownerOrgId: 'idOrgTest',
    accessibility: 'public'
  }
];
const testEventsScreening = [
  {
    id: 'eventTest',
    type: 'screening',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' },
    accessibility: 'private'
  }
];
const acceptedUserA = {
  uid: 'uidUserTest',
  email: 'A@fake.com',
  firstName: 'foo',
  lastName: 'bar'
};

const testUsers = [acceptedUserA, { uid: 'uidUserTestNotAccepted' }];
const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];
const testRequestAccessToken: RequestAccessToken = { eventId: 'eventTest', credentials: acceptedUserA };

describe('Twilio test script', () => {

  beforeAll(async () => {
    initFunctionsTestMock();
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should throw error when eventId is null', async () => {
    // Load our test set
    try {
      await populateAndGetTwilioAccessToken(true, { eventId: '' });
    } catch (e) {
      expect(e).toMatchObject(new Error(`No 'eventId' params, this parameter is mandatory !`));
    }
  });

  it('should throw error when auth is null', async () => {
    // Load our test set
    try {
      await populateAndGetTwilioAccessToken(true, null, null);
    } catch (e) {
      expect(e).toMatchObject(new Error('Unauthorized call !'));
    }
  });

  it('should return error when event is not found', async () => {
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken(true, { eventId: 'unknown' });
    expect(output.error).toEqual('UNKNOWN_EVENT');
  });

  it('should return error when event type is not meeting', async () => {

    // Load our test set
    const output = await populateAndGetTwilioAccessToken(false);
    expect(output.error).toEqual('NOT_A_MEETING');
  });

  it('should return error when event has not started yet', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].start.setHours(new Date().getHours() + 1);
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set

    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toEqual('NOT_ALREADY_STARTED');
  });

  it('should return error when event is finished', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].start.setHours(new Date().getHours() - 5);
    testEvents[0].end.setHours(new Date().getHours() - 1);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toEqual('EVENT_FINISHED');
  });

  it('should return error if user is not invited', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken(true, null, { uid: 'uidUserTestNotAccepted' });
    expect(output.error).toEqual('NOT_ACCEPTED');
  });

  it('private event - should be successful when informations are correct', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toEqual('');
  });

  it('protected event - should be successful when user is invited', async () => {
    testEvents[1].start = new Date();
    testEvents[1].end = new Date();
    testEvents[1].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const credentials = {
      email: 'foo@bar.com',
      firstName: 'foo',
      lastName: 'bar'
    };
    const output = await populateAndGetTwilioAccessToken(true, { eventId: 'eventTestInvOnly', credentials }, { uid: 'uidFooBar' });
    expect(output.error).toEqual('');
  });

  it('protected event - should return error when user is not invited', async () => {
    testEvents[1].start = new Date();
    testEvents[1].end = new Date();
    testEvents[1].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const credentials = {
      email: 'marc@hamill.com',
      firstName: 'marc',
      lastName: 'hamill'
    };
    const output = await populateAndGetTwilioAccessToken(true, { eventId: 'eventTestInvOnly', credentials }, { uid: 'uidMarcHamill' });
    expect(output.error).toEqual('NOT_ACCEPTED');
  });

  it('public event - should be successful if user is connected', async () => {
    testEvents[2].start = new Date();
    testEvents[2].end = new Date();
    testEvents[2].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const credentials = {
      firstName: 'anonymous',
      lastName: 'user'
    };
    const output = await populateAndGetTwilioAccessToken(true, { eventId: 'eventTestPublic', credentials }, { uid: 'uidFooBar' });
    expect(output.error).toEqual('');
  });

  it('public event - should return error when event has not started yet', async () => {
    testEvents[2].start = new Date();
    testEvents[2].end = new Date();
    testEvents[2].start.setHours(new Date().getHours() + 1);
    testEvents[2].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const credentials = {
      firstName: 'anonymous',
      lastName: 'user'
    };
    const output = await populateAndGetTwilioAccessToken(true, { eventId: 'eventTestPublic', credentials }, { uid: 'uidFooBar' });
    expect(output.error).toEqual('NOT_ALREADY_STARTED');
  });
})

async function populateAndGetTwilioAccessToken(eventMeeting = true, requestAccessTokenTest = null, uid = { uid: 'uidUserTest' }) {
  const invitation = populate('invitations', testInvitations);
  const events = populate('events', (eventMeeting) ? testEvents : testEventsScreening);
  const users = populate('users', testUsers);
  const orgs = populate('orgs', testOrgs);
  await Promise.all([invitation, events, users, orgs]);
  const testCallbackContext: CallableContextOptions = {
    auth: uid
  }
  return await getTwilioAccessToken(requestAccessTokenTest || testRequestAccessToken, testCallbackContext as CallableContext);
}
