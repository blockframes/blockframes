process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp, eventFixtures } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { onEventDeleteEvent } from './main';
import firebaseTest = require('firebase-functions-test');
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { endMaintenance } from '@blockframes/firebase-utils';

const testEnv = firebaseTest(firebase());

describe('Event backend-function unit-tests', () => {
  const db = admin.firestore();

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.test.rules', eventFixtures.fixtures);
    await endMaintenance();
  });

  afterAll(async () => {
    // After all tests, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Event spec', () => {

    it('removes all matching eventId docs from "invitations & notification" collection', async () => {
      const wrapped = testEnv.wrap(onEventDeleteEvent);
      const eventId = 'E001';

      const eventToDelete = { id: eventId };

      const eventSnap = testEnv.firestore.makeDocumentSnapshot(
        eventToDelete,
        `events/${eventId}`
      );

      // Check documents before event delete
      const invitationsCollectionRefBefore = await db.collection('invitations')
        .where('eventId', '==', eventId)
        .get();
      expect(invitationsCollectionRefBefore.docs).toHaveLength(2);

      const notificationsCollectionRefBefore = await db.collection('notifications')
        .where('docId', '==', eventId)
        .get();
      expect(notificationsCollectionRefBefore.docs).toHaveLength(1);

      // Trigger onEventDeleteEvent event
      await wrapped(eventSnap); // Only snapshot is used in onEventDeleteEvent

      // Check documents after delete
      const invitationsCollectionRefAfter = await db.collection('invitations')
        .where('eventId', '==', eventId)
        .get();
      expect(invitationsCollectionRefAfter.docs).toHaveLength(0);

      const notificationsCollectionRefAfter = await db.collection('notifications')
        .where('docId', '==', eventId)
        .get();
      expect( notificationsCollectionRefAfter.docs).toHaveLength(0);
    });
  });
})
