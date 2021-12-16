import { resolve } from 'path';
import { Firestore, initFirestoreApp  } from '@blockframes/testing/firebase/functions';
import { inviteUsers }  from './main';
import firebaseTest = require('firebase-functions-test');
import * as admin from 'firebase-admin';
import { createInvitation } from '@blockframes/invitation/+state';
import * as userOps from './internals/users';
import { firebase } from '@env';

//We are testing against actual project with shrunk DB
const projectRealId = firebase().projectId;
const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
const testEnv = firebaseTest(firebase(), pathToServiceAccountKey);

describe('Invitation backend-function unit-tests', () => {
  let db: Firestore;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    // We are initing firestore with client settings to
    // test the functions effectively
    db = await initFirestoreApp(projectRealId, '', {}, { uid: 'uid-c8', firebase: { sign_in_provider: 'password' } });
  });

  afterEach(async () => {
    // After each test, db is reseted
    //await clearFirestoreData({ projectId: getTestingProjectId() });
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
  
      const context = {

      };

      //await wrapped(data, context).rejects.toThrow('Permission denied: missing auth context.');

      // Call the wrapped function with data and context
      //const result = await wrapped(data);
      // Check that the result looks like we expected.
      // expect(_inviteUsers).toThrowError(
      //   new Error('Permission denied: missing auth context.')
      // );
      expect.assertions(1);
      await expect(async ()=> {
        await wrapped(data, context)
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
          uid: '1M9DUDBATqayXXaXMYThZGtE9up1',
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
          uid: '1M9DUDBATqayXXaXMYThZGtE9up1',
          token: ''
        }
      };

      //expect.assertions(0);
      // (await expect(await wrapped(data, context)))
      //             .resolves
      //             .toEqual([]);

      const result = await wrapped(data, context);
      expect(result).toEqual("");
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
          uid: '1M9DUDBATqayXXaXMYThZGtE9up1',
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
      console.log(result);
      expect(result[0]).toEqual(
        expect.objectContaining({
          error: ''
        })
      );

      const inviteId = result[0].id;
      console.log(inviteId);

      const snap = await admin.firestore().collection("invitations").doc(inviteId).get();
      console.log(snap);
      const inviteData = snap.data();
      console.log(inviteData);
      expect(inviteData.id).toEqual(inviteId);
      //TODO : check more details
      //expect(inviteData.email).toEqual(email);
    });
  });
})
