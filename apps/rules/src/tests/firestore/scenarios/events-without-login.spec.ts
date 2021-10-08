import { apps } from '@firebase/rules-unit-testing';
import { testFixture } from './../fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe('Events Rules Tests', () => {
  const projectId = `evrules-spec-${Date.now()}`;
  let db: Firestore;


  describe('Anonymous user wants to attend a public event', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8-anon', firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('Gathering required data for a public screening', async () => {
      // 1 Invitation - Fetching invitation to event, knowing its ID
      const invitationRef = db.doc('invitations/I013');
      const invitationDoc = await invitationRef.get();
      const { eventId } = invitationDoc.data();
      expect(eventId).toEqual('E003-public');

      // 2 Event - Fetching event from eventId found in invitation doc
      const eventRef = db.doc(`events/${eventId}`);
      const eventDoc = await eventRef.get();
      const { ownerOrgId, accessibility, type, meta } = eventDoc.data();
      expect(ownerOrgId).toEqual('O001');
      expect(accessibility).toEqual('public');
      expect(type).toEqual('screening');
      expect(meta.titleId).toEqual('MI-0d7');

      // 3 Movie - Fetching movie title from titleId found in event doc
      const movieRef = db.doc(`movies/${meta.titleId}`);
      const movieDoc = await movieRef.get();
      const { title } = movieDoc.data();
      expect(title.original).toEqual('UnitTest Eraser');

      // 4 Org - Owner of the event from ownerOrgId found in event doc
      const orgRef = db.doc(`orgs/${ownerOrgId}`);
      const orgDoc = await orgRef.get();
      const { id } = orgDoc.data();
      expect(id).toEqual('O001');
    });

  });

  describe('Anonymous user wants to attend an invitation-only event', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8-anon', firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    // @TODO #6756 implement
  });
});
