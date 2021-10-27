import { getTwilioAccessToken, RequestAccessToken } from "./twilio";
import { CallableContextOptions } from "firebase-functions-test/lib/main";
import { CallableContext } from "firebase-functions/lib/providers/https";
import { getTestingProjectId, initFunctionsTestMock, populate } from "@blockframes/testing/firebase/functions";
import { clearFirestoreData } from "@firebase/testing";

const testInvitations = [
  {
    id: 'invit-A',
    type: 'attendEvent',
    eventId: 'eventTest',
    status: 'accepted',
    mode: 'invitation',
    fromOrg: { id: 'org-A' },
    toUser: { uid: 'uidUserTest' },
  }
];
const testEvents = [
  {
    id: 'eventTest',
    type: 'meeting',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' },
    ownerOrgId: 'idOrgTest'
  }
];
const testEventsScreening = [
  {
    id: 'eventTest',
    type: 'screening',
    start: new Date(),
    end: new Date(),
    meta: { organizerUid: 'uidUserTest' }
  }
];
const acceptedUser = {
  uid: 'uidUserTest',
  email: 'A@fake.com',
  firstName: 'foo',
  lastName: 'bar'
};

const testUsers = [acceptedUser, { uid: 'uidUserTestNotAccepted' }];
const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];
const testRequestAccessToken: RequestAccessToken = { eventId: 'eventTest', credentials: acceptedUser };

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
    expect(output.error).toMatch('UNKNOWN_EVENT');
  });

  it('should return error when event type is not meeting', async () => {

    // Load our test set
    const output = await populateAndGetTwilioAccessToken(false);
    expect(output.error).toMatch('NOT_A_MEETING');
  });

  it('should return error when event has not started yet', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].start.setHours(new Date().getHours() + 1);
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set

    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toMatch('NOT_ALREADY_STARTED');
  });

  it('should return error when event is finished', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].start.setHours(new Date().getHours() - 5);
    testEvents[0].end.setHours(new Date().getHours() - 1);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toMatch('EVENT_FINISHED');
  });

  it('should return error if user is not invited', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken(true, null, { uid: 'uidUserTestNotAccepted' });
    expect(output.error).toMatch('NOT_ACCEPTED');
  });

  it('should be successful when informations are correct', async () => {
    testEvents[0].start = new Date();
    testEvents[0].end = new Date();
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetTwilioAccessToken();
    expect(output.error).toMatch('');
  });
})

async function populateAndGetTwilioAccessToken(eventMeeting = true, requestAccessTokenTest = null, uid = { uid: 'uidUserTest' }) {
  const invitationn = populate('invitations', testInvitations);
  const events = populate('events', (eventMeeting) ? testEvents : testEventsScreening);
  const users = populate('users', testUsers);
  const orgs = populate('orgs', testOrgs);
  await Promise.all([invitationn, events, users, orgs]);
  const testCallbackContext: CallableContextOptions = {
    auth: uid
  }
  requestAccessTokenTest = (requestAccessTokenTest === null) ? testRequestAccessToken : requestAccessTokenTest;
  return await getTwilioAccessToken(requestAccessTokenTest, testCallbackContext as CallableContext);
}
