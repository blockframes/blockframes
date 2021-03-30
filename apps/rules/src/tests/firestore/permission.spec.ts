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

    test('id different from orgId, should not be able to create document', async () => {
      const docName = 'permissions/O123';
      const docData = {id: 'O111', note: 'id is different from orgId'};
      const permissionDocRef = db.doc(docName);
      await assertFails(permissionDocRef.set(docData));
    });

    test('id not set; org status pending, should be able to create document', async () => {
      const docName = 'permissions/O003';
      const docData = {note: 'id is different from orgId'};
      const permissionDocRef = db.doc(docName);
      await assertSucceeds(permissionDocRef.set(docData));
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


//documentPermissions sub collection
describe('Document Permission Sub Collection Rules Tests', () => {
  const projectId = `doc-permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('id not set, should be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP01');
      await assertSucceeds(permissionDocRef.set({note: 'This is a create test'}));
    });

    test('id not same as docID, should not be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP02');
      await assertFails(permissionDocRef.set({id: 'DP00', note: 'This is a create test'}));
    });

    test('should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertFails(permissionDocRef.update({note: 'This is a test'}));
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('changing doc Id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertFails(permissionDocRef.update({id: 'P111', note: 'This is a test'}));
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertSucceeds(permissionDocRef.update({note: 'This is a test'}));
    });
  });
});
