import { apps, assertSucceeds } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';


describe('Permission Rules Tests', () => {
  const projectId = `permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user with member role should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user with admin role should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });
  });

  describe('With User as Super Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user with superadmin role should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });
  });  
});
