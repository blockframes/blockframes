process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { createConsent } from './main';
import { ConsentData } from './consent';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/data';
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { endMaintenance } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Consent backend-function unit-tests', () => {

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.test.rules', testFixture);
    await endMaintenance();
  });

  afterAll(async () => {
    // After all tests, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Consents spec', () => {
    it('missing auth context, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
        consentType: 'access',
        ip: '',
        docId: ''
      };

      expect.assertions(1);
      await expect(wrapped(data, {}))
            .rejects
            .toThrow('Permission denied: missing auth context.');
    });

    it('missing user data, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
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
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Invalid user');
    });

    it('missing org ID, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
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
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Invalid organization');
    });

    it('missing docID in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
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
      await expect(wrapped(data, context))
            .rejects
            .toThrow('Undefined docId');
    });

    it('missing ip in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
        consentType: 'access',
        ip: '',
        docId: 'O001'
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
            .toThrow('Undefined ip');
    });

    it('missing filePath in data param, throws error', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
        consentType: 'access',
        ip: '10.0.0.1',
        docId: 'O001'
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
            .toThrow('Invalid filePath');
    });

    it('creates \'Access Type\' consents document', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
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

      //Fetch the updated consents data and compare the result
      const snap = await admin.firestore().collection('consents').doc(data.docId).get();
      const consentsData = snap.data();
      expect(consentsData).toEqual(
        expect.objectContaining({
          id:'O001',
          share: []
        })
      );

      expect(consentsData.access[0]).toEqual(
        expect.objectContaining({
          docId: 'O001',
          email: 'u2@cascade8.com',
          firstName: 'User',
          lastName: 'Two',
          ip: '10.0.0.1'
        })
      );
    });

    it('creates \'Share Type\' consents document', async () => {
      const wrapped = testEnv.wrap(createConsent);

      //Compose the call to simpleCallable cf with param data
      const data: ConsentData = {
        consentType: 'share',
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
          id:'O001'
        })
      );

      expect(consentsData.share[0]).toEqual(
        expect.objectContaining({
          docId: 'O001',
          email: 'u2@cascade8.com',
          firstName: 'User',
          lastName: 'Two',
          ip: '10.0.0.1'
        })
      );
    });
  });
})
