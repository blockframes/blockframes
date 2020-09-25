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

  it('should throw error when eventId is null', async () => {
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
      auth : {
        uid: 'uidUserTest'
      }
    }
    const testRequestAccessToken:RequestAccessToken = { eventId: 'eventTest'};
    testRequestAccessToken.eventId = '';
    try {

      await getTwilioAccessToken(testRequestAccessToken, testCallbackContext as CallableContext);
    } catch (e) {
      expect(e).toMatchObject(new Error(`No 'eventId' params, this parameter is mandatory !`));
    }
  });

  it('should throw error when auth is null', async () => {
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
    try {
      await getTwilioAccessToken(testRequestAccessToken, testCallbackContext as CallableContext);
    } catch (e) {
      expect(e).toMatchObject(new Error('Unauthorized call !'));
    }
  });

  it('should return error when event is not found', async () => {
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
   testEvents[0].end.setHours(testEvents[0].end.getHours() + 4);
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
   testRequestAccessToken.eventId = 'unknown';
   const output = await getTwilioAccessToken(testRequestAccessToken, testCallbackContext as CallableContext);

   expect(output.error).toMatch('UNKNOWN_EVENT');
  });

  it('should return error when event type is not meeting', async () => {
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
        type: 'screening',
        start: new Date(),
        end: new Date(),
        meta: {organizerId: 'uidUserTest'}
      }
    ];
    testEvents[0].end.setHours(testEvents[0].end.getHours() + 4);
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

    expect(output.error).toMatch('NOT_A_MEETING');
  });

  it('should return error when event has not started yet', async () => {
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
    testEvents[0].start.setHours(testEvents[0].end.getHours() + 1);
    testEvents[0].end.setHours(testEvents[0].end.getHours() + 4);
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

    expect(output.error).toMatch('NOT_ALREADY_STARTED');
  });

  it('should return error when event is finished', async () => {
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
    testEvents[0].start.setHours(testEvents[0].end.getHours() - 5);
    testEvents[0].end.setHours(testEvents[0].end.getHours()  - 1 );
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

    expect(output.error).toMatch('EVENT_FINISHED');
  });

  it('should return error if user is not invited', async () => {
    const testInvitations = [
      {
        id: 'invit-A',
        type: 'attendEvent',
        docId: 'eventTest',
        status: 'accepted',
        mode: 'invitation',
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'uidUserTest2' },
      }
    ];
    const testEvents = [
      {
        id: 'eventTest',
        type: 'meeting',
        start: new Date(),
        end: new Date(),
        meta: {organizerId: 'uidUserTest2'}
      }
    ];
    testEvents[0].end.setHours(testEvents[0].end.getHours() + 4);
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

    expect(output.error).toMatch('NO_INVITATION');
  });

  it('should be successful when informations are correct', async () => {
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

    testEvents[0].end.setHours(testEvents[0].end.getHours() + 4);
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

    expect(output.error).toMatch('');
  });
})
