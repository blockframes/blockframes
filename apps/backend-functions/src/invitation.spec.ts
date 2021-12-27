﻿process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { inviteUsers } from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/inviteUsers';
import * as admin from 'firebase-admin';
import * as userOps from './internals/users';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { ErrorResultResponse } from './utils';
import { UserInvitation } from './invitation';
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

  describe.skip('\'inviteUsers\' tests', () => {
    it('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {},
        app: 'catalog'
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, {})
      }).rejects
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
      await expect(async () => {
        await wrapped(data, context)
      }).rejects
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
      const wrapped = testEnv.wrap(inviteUsers);

      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {},
        app: 'catalog'
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, {})
      }).rejects
        .toThrow('Permission denied: missing auth context.');
    });
  });
})
