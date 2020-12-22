import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

//TODO: 4195
describe.skip('Invitation Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should not allow user to create ', async () => {
    const notifRef = db.doc('invitations/001');
    await assertFails(notifRef.set({ note: 'A notification' }));
  });
});

