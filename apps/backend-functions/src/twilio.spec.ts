import {getTwilioAccessToken, RequestAccessToken} from "./twilio";
import {CallableContextOptions} from "firebase-functions-test/lib/main";
import {CallableContext} from "firebase-functions/lib/providers/https";
import {populate} from "@blockframes/testing/firebase/functions";

describe('Twilio test script', () => {
  beforeAll(() => {
    // initFunctionsTestMock();
    // adminAuth = new AdminAuthMocked() as any;

    // To be sure that tests are not polluted
  });

  afterEach(async () => {
    // After each test, db is reseted
    // await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should return error as "" (empty) when getTwilioAccessToken is called', async () => {
    const testInvitations = [
      {
        id: 'invit-A',
        type: 'attendEvent',
        docId: 'eventTest',
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
        meta: {organizerId: 'uidUserTest'}
      }
    ];

    const testUsers = [{ uid: 'uidUserTest', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];
    // Load our test set
    await populate('invitations', testInvitations);
    await populate('events', testEvents);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const testCallbackContext : CallableContextOptions = {
      auth : {
        uid: 'uidUserTest'
      }
    }
    const testRequestAccessToken:RequestAccessToken = { eventId: 'eventTest'};
    const output = await getTwilioAccessToken(testRequestAccessToken, testCallbackContext as CallableContext);
    expect(output).toMatchObject({error: ''});
  });

  it('should throw error when getTwilioAccessToken is called', async () => {
    const testInvitations = [
      {
        id: 'invit-A',
        type: 'attendEvent',
        docId: 'eventTest',
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
        meta: {organizerId: 'uidUserTest'}
      }
    ];

    const testUsers = [{ uid: 'uidUserTest', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];
    // Load our test set
    await populate('invitations', testInvitations);
    await populate('events', testEvents);
    await populate('users', testUsers);
    await populate('orgs', testOrgs);

    const testCallbackContext : CallableContextOptions = {
      auth : null
    }
    const testRequestAccessToken:RequestAccessToken = { eventId: 'eventTest'};
    const output = await getTwilioAccessToken(testRequestAccessToken, testCallbackContext as CallableContext);
    expect(output).toThrowError('Unauthorized call !');
  });

  /*
  *
  data: RequestAccessToken,
  context: CallableContext
  * */
})
