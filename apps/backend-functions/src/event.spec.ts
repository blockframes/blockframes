process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
import { initFirestoreApp } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from '@firebase/rules-unit-testing';
import { onEventDeleteEvent } from './main';
import firebaseTest = require('firebase-functions-test');
import { testFixture } from './fixtures/data';
import * as admin from 'firebase-admin';
import { firebase } from '@env';
import { expect } from '@jest/globals';
import { endMaintenance } from '@blockframes/firebase-utils';
import { Screening } from '@blockframes/event/+state/event.firestore';
import { createScreening } from '@blockframes/event/+state/event.model';

const testEnv = firebaseTest(firebase());

describe('Event backend-function unit-tests', () => {
  const db = admin.firestore();

  beforeAll(async () => {
    await initFirestoreApp(firebase().projectId, 'firestore.test.rules', testFixture);
    await endMaintenance();
  });

  afterAll(async () => {
    // After all tests, db is reseted
    await clearFirestoreData({ projectId: firebase().projectId });
  });

  describe('Event spec', () => {

    it('removes all matching eventId docs from \'invitations & notification\' collection', async () => {
      const wrapped = testEnv.wrap(onEventDeleteEvent);
      const eventID = 'E001';
      const orgID = 'O001';

      const localEvent: Screening = createScreening({
        //id: eventID,
        organizerUid: orgID,
        titleId: 'UnitTest Event',
        description: 'Event organised by Jest',
      });

      const eventData = {
        id: eventID,
        ...localEvent
      }

      const eventSnap  = testEnv.firestore.makeDocumentSnapshot(
        eventData,
        `events/${eventID}`
      );

      //Trigger onEventDeleteEvent event
      await wrapped(eventSnap);

      let collectionRef = await db.collection('invitations')
                                          .where('eventId',  '==', eventID)
                                          .get();
      let queriedDocs = collectionRef.docs;
      expect(queriedDocs).toHaveLength(0);

      collectionRef = await db.collection('notifications')
                              .where('docId',  '==', eventID)
                              .get();
      queriedDocs = collectionRef.docs;
      expect(queriedDocs).toHaveLength(0);
    });
  });
})
