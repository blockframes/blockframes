process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { inviteUsers, acceptOrDeclineInvitationAsAnonymous } from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/data';
import * as admin from 'firebase-admin';
import * as userOps from './internals/users';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { ErrorResultResponse } from './utils';
import { UserInvitation, AnonymousInvitationAction } from './invitation';
import { endMaintenance } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Invitation backend-function unit-tests', () => {

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.rules', testFixture);
    await endMaintenance();
  });

  afterAll(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('\'inviteUsers\' tests', () => {
    it('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {},
        app: 'catalog'
      };

      expect.assertions(1);
      await expect(wrapped(data, {}))
            .rejects
            .toThrow('Permission denied: missing auth context.');
    });

    it('missing org ID, throws error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {},
        app: 'catalog'
      };

      const context = {
        auth: {
          uid: 'uid-c8',
          token: ''
        }
      };

      expect.assertions(1);
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Permission denied: missing org id.');
    });

    it('with proper data, does not throw error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data: UserInvitation = {
        emails: [],
        invitation: {
          id: '',
          type: 'joinOrganization',
          mode: 'invitation',
          date: new Date()
        },
        app: 'catalog'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      const result = await wrapped(data, context);
      expect(result).toEqual([]);
    });

    it('For \'Join organization\' event, email is sent & invite doc created', async () => {
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data: UserInvitation = {
        emails: ['test@cascade8.com'],
        invitation: {
          id: '',
          type: 'joinOrganization',
          mode: 'invitation',
          date: new Date()
        },
        app: 'catalog'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      //Mock send email function
      jest.spyOn(userOps, 'getOrInviteUserByMail').mockImplementation(async (email: string) => {
        return {
          user: {
            uid: 'User001',
            email,
            firstName: 'User001-name'
          },
          invitationStatus: 'pending'
        };
      });

      // Should call 'inviteUsers' without any errors
      const result: ErrorResultResponse[] = await wrapped(data, context);

      //Check if email is sent
      expect(userOps.getOrInviteUserByMail).toHaveBeenCalled();

      //Check results have correct data
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          error: ''
        })
      );

      const inviteId = result[0].result;
      const snap = await admin.firestore().collection('invitations').doc(inviteId).get();
      const inviteData = snap.data();
      expect(inviteData.id).toEqual(inviteId);
      expect(inviteData.toUser).toEqual(
        expect.objectContaining({
          uid: 'User001'
        })
      );
    });
  });

  describe('\'acceptOrDeclineInvitationAsAnonymous\' tests', () => {
    it('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      //Compose the call to simpleCallable cf with param data
      const data: AnonymousInvitationAction = {
        email: 'test@cascade8.com',
        invitationId: 'I001',
        status: 'accepted'
      };

      expect.assertions(1);
      await expect(wrapped(data, {}))
            .rejects
            .toThrow('Permission denied: missing auth context.');

    });

    it('Non-existent invitation, throws error', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      const data: AnonymousInvitationAction = {
        email: 'test@cascade8.com',
        invitationId: 'I004',
        status: 'pending'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };
      expect.assertions(1);
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Permission denied: invalid invitation');
    });

    it('Invitation type is not \'attendEvent\', throws error', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      //Compose the call to simpleCallable cf with param data
      const data: AnonymousInvitationAction = {
        email: 'test@cascade8.com',
        invitationId: 'I001',
        status: 'pending'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };
      expect.assertions(1);
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Permission denied: invalid invitation');
    });

    it('Invitation mode is not \'invitation\', throws error', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      //Compose the call to simpleCallable cf with param data
      const data: AnonymousInvitationAction = {
        email: 'test@cascade8.com',
        invitationId: 'I002',
        status: 'pending'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };
      expect.assertions(1);
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Permission denied: invalid invitation');
    });

    it('Invitation to user email ID is not same, throws error', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      //Compose the call to simpleCallable cf with param data
      const data: AnonymousInvitationAction = {
        email: 'test1@cascade8.com',
        invitationId: 'I003',
        status: 'pending'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };
      expect.assertions(1);
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Permission denied: invalid invitation');
    });

    it('With proper Invitation, updates document status correctly', async () => {
      const wrapped = testEnv.wrap(acceptOrDeclineInvitationAsAnonymous);

      //Compose the call to simpleCallable cf with param data
      const data: AnonymousInvitationAction = {
        email: 'test@cascade8.com',
        invitationId: 'I003',
        status: 'accepted'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };
      const result = await wrapped(data, context);
      expect(result).toBeTruthy();

      const snap = await admin.firestore().collection('invitations').doc(data.invitationId).get();
      const inviteData = snap.data();
      expect(inviteData).toEqual(
        expect.objectContaining({
          id: data.invitationId,
          status: data.status
        })
      );
    });
  });
})
