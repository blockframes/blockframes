﻿process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp, permissionsFixtures } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { onDocumentPermissionCreateEvent, onPermissionDeleteEvent } from './main';
import firebaseTest = require('firebase-functions-test');
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { endMaintenance, getDb } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Permissions backend-function unit-tests', () => {
  const db = getDb();

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.test.rules', permissionsFixtures);
    await endMaintenance();
  });

  afterAll(async () => {
    // After all tests, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Permission spec', () => {
    it('sets the "authorOrgId" of docIndex', async () => {
      const wrapped = testEnv.wrap(onDocumentPermissionCreateEvent);
      const docID = 'D001';
      const orgID = 'O001';

      const context = { params: { docID, orgID } };

      const snapBefore = await db.doc(`docsIndex/${docID}`).get();
      expect(snapBefore.data()).toBeUndefined();

      // Call the function
      const snap = testEnv.firestore.makeDocumentSnapshot({}, `docsIndex/${docID}`); // Only context is used in onDocumentPermissionCreateEvent
      await wrapped(snap, context);

      const snapAfter = await db.doc(`docsIndex/${docID}`).get();
      expect(snapAfter.data()).toEqual(
        expect.objectContaining({
          authorOrgId: orgID
        })
      );
    });

    it('removes all subcollections from "permissions/{orgID}"', async () => {
      const wrapped = testEnv.wrap(onPermissionDeleteEvent);
      const docID = 'D001';
      const orgID = 'O001';

      // Check permission document exists
      const docRef = db.doc(`permissions/${orgID}/documentPermissions/${docID}`);
      const documentPermissionBefore = await docRef.get();
      expect(documentPermissionBefore.data()).toBeDefined();

      const permissionBefore = await db.doc(`permissions/${orgID}`).get();
      expect(permissionBefore.data()).toEqual(
        expect.objectContaining({
          id: orgID,
          roles: {}
        })
      );

      // Call the function
      const snap = testEnv.firestore.makeDocumentSnapshot(permissionBefore.data(), `permissions/${orgID}`);
      await wrapped(snap); // Only snapshot is used in onPermissionDeleteEvent

      // Check that documentPermissions have been deleted
      const documentPermissionAfter = await db.doc(`permissions/${orgID}/documentPermissions/${docID}`).get();
      expect(documentPermissionAfter.data()).toBeUndefined();
    });
  });
})
