import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
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

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({note: 'This is a test'}));
    });

  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.update({note: 'This is a test'}));
    });

    test('when updating id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({id: 'O002', note: 'This is a test'}));
    });
  });

  describe('With User as Super Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.update({note: 'This is a test'}));
    });

    test('when updating id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({id: 'O002', note: 'This is a test'}));
    });
  });
});
