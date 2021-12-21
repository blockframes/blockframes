import { resolve } from 'path';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { inviteUsers }  from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/data';

import * as admin from 'firebase-admin';
import * as userOps from './internals/users';
import { firebase } from '@env';

const projectRealId = firebase().projectId;
const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
const testEnv = firebaseTest(firebase(), pathToServiceAccountKey);

describe('Invitation backend-function unit-tests', () => {

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    // We are initing firestore with client settings to
    // test the functions effectively
    await initFirestoreApp(projectRealId, '', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
  });

  afterAll(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: projectRealId });
  });


  describe("Invitation spec", () => {
    it('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);
  
      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {},
        app: 'catalog'
      };

      expect.assertions(1);
      await expect(async ()=> {
        await wrapped(data, { })
      }).rejects
        .toThrow("Permission denied: missing auth context.");
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
      await expect(async ()=> {
        await wrapped(data, context)
      }).rejects
        .toThrow("Permission denied: missing org id.");
    });

    it('with proper data, does not throw error', async () => {
      const wrapped = testEnv.wrap(inviteUsers);
  
      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: [],
        invitation: {
          id: '',
          type: 'Join organization',
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

    it("For 'Join organization' event, email is sent & invite doc created", async () => {
      const wrapped = testEnv.wrap(inviteUsers);
  
      //Compose the call to simpleCallable cf with param data
      const data = {
        emails: ['test@cascade8.com'],
        invitation: {
          id: '',
          type: 'Join organization',
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
            email
          },
          invitationStatus: 'pending'
        };
      });

      // Should call 'inviteUsers' without any errors
      const result = await wrapped(data, context);

      //Check if email is sent
      expect(userOps.getOrInviteUserByMail).toHaveBeenCalled();

      //Check results have correct data
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          error: ''
        })
      );

      const inviteId = result[0].id;
      const snap = await admin.firestore().collection("invitations").doc(inviteId).get();
      const inviteData = snap.data();
      expect(inviteData.id).toEqual(inviteId);
      expect(inviteData.toUser).toEqual(
        expect.objectContaining({
          uid: 'User001'
        })
      );
    });
  });
})
