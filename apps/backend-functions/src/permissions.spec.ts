process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { onDocumentPermissionCreateEvent } from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/data';
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { endMaintenance } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Permissions backend-function unit-tests', () => {

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.test.rules', testFixture);
    await endMaintenance();
  });

  afterAll(async () => {
    // After all tests, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Permission spec', () => {
    it('sets the \'authorOrgId\' of docIndex', async () => {
      const wrapped = testEnv.wrap(onDocumentPermissionCreateEvent);
      const docID = 'D001';
      const orgID = 'O001';

      const context = {
        params: { docID, orgID }
      };

      // Make a fake document snapshot to pass to the function
      const after = testEnv.firestore.makeDocumentSnapshot(
        {
          id: docID,
        },
        `docsIndex/${docID}`
      );

      // Call the function
      await wrapped(after, context);

      const snap = await admin.firestore().doc(`docsIndex/${docID}`).get();
      expect(snap.data()).toEqual(
        expect.objectContaining({
          authorOrgId: orgID
        })
      );
    });

  });
})
