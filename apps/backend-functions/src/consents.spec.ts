process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { createConsent } from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/inviteUsers';
import * as admin from 'firebase-admin';
import * as userOps from './internals/users';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { ErrorResultResponse } from './utils';
import { ConsentType } from '@blockframes/consents/+state/consents.firestore';
import { endMaintenance } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Invitation backend-function unit-tests', () => {
  let db;

  beforeAll(async () => {
    db = await initFirestoreApp(firebase().projectId, 'firestore.test.rules', testFixture);
    await endMaintenance();
  });

  afterAll(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Consents spec', () => {
    it.skip('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        ip: '',
        docId: ''
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, {})
      }).rejects
        .toThrow('Permission denied: missing auth context.');
    });

    it.skip('missing user data, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        ip: '',
        docId: ''
      };

      const context = {
        auth: {
          uid: 'uid-c9',
          token: ''
        }
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, context)
      }).rejects
        .toThrow('Invalid user');
    });

    it.skip('missing org ID, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        ip: '',
        docId: ''
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
        .toThrow('Invalid organization');
    });

    it.skip('missing docID in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        ip: '',
        docId: ''
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, context)
      }).rejects
        .toThrow('Undefined docId');
    });

    it.skip('missing ip in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        ip: '',
        docId: 'D001'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, context)
      }).rejects
        .toThrow('Undefined ip');
    });

    it.skip('missing filePath in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        filePath: '/c/o/marketplace',
        ip: '10.0.0.1',
        docId: 'D001'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      expect.assertions(1);
      await expect(async () => {
        await wrapped(data, context)
      }).rejects
        .toThrow('Invalid filePath');
    });

    it.skip('creates \'Access Type\' consents document', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'access',
        filePath: '/c/o/marketplace',
        ip: '10.0.0.1',
        docId: 'O001'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      const result = await wrapped(data, context);
      expect(result).toBeTruthy();

      //Complete the operation..
      await new Promise((r) => setTimeout(r, 5000));  
    });

    it('creates \'Share Type\' consents document', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
        consentType: 'share',
        filePath: '/c/o/marketplace',
        ip: '10.0.0.1',
        docId: 'O001'
      };

      const context = {
        auth: {
          uid: 'uid-user2',
          token: ''
        }
      };

      const result = await wrapped(data, context);
      expect(result).toBeTruthy();

      //Fetch the data and compare the result
      const snap = await admin.firestore().collection('consents').doc(data.docId).get();
      const consentsData = snap.data();
      expect(consentsData).toEqual(
        expect.objectContaining({
          id:"O001",
        })
      );

      expect(consentsData.share[0]).toEqual(
        expect.objectContaining({
          docId: "O001",
          email: "u2@cascade8.com"
        })
      );
      //Complete the operation..
      await new Promise((r) => setTimeout(r, 5000));  
    });

    it.skip('with proper data, does not throw error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data = {
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

  });
})
