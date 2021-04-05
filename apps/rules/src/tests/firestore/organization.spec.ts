import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe('Organization Rules Tests', () => {
  const projectId = `orgrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertSucceeds(orgDocRef.get());
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.delete());
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertSucceeds(orgDocRef.get());
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.delete());
    });
  });
});


//Carts sub collection
describe('Carts Sub Collection Rules Tests', () => {
  const projectId = `doc-permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertSucceeds(cartDocRef.get());
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertSucceeds(cartDocRef.get());
    });
  });
});