import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/unit-tests';

describe('Permission Rules Tests', () => {
  const projectId = `permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('not in org, should not be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O003');
      await assertFails(permissionDocRef.get());
    });

    test('should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({ note: 'This is a test' }));
    });

    test('id different from docID, should not be able to create document', async () => {
      const docName = 'permissions/O123';
      const docData = { id: 'O111', note: 'id is different from docID' };
      const permissionDocRef = db.doc(docName);
      await assertFails(permissionDocRef.set(docData));
    });

    test('Org not created alongside, should not be able to create document', async () => {
      const docName = 'permissions/O123';
      const docData = { id: 'O123', note: 'id is good, but Org is not created' };
      const permissionDocRef = db.doc(docName);
      await assertFails(permissionDocRef.set(docData));
    });
  });

  describe('With User as or going to be Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user4', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    //test the scenario when org and permission is created at the same time..
    test('org not yet created, should be able to create document', async () => {
      const docName = 'permissions/O0X4';
      const docData = { id: 'O0X4', roles: { 'uid-user4': 'member' }, note: 'Creating org and permission doc' };
      const permissionDocRef = db.doc(docName);
      const orgDoc = 'orgs/O0X4';
      const orgUserIds = ['uid-user4'];

      await db.runTransaction(async tx => {
        const orgRef = db.doc(orgDoc);
        tx.set(orgRef, { status: 'pending', userIds: orgUserIds });
        tx.set(permissionDocRef, docData);
      });

      await assertSucceeds(permissionDocRef.get());
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.update({ note: 'This is a test' }));
    });

    test('when updating id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({ id: 'O002', note: 'This is a test' }));
    });
  });

  describe('With User as Super Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertSucceeds(permissionDocRef.update({ note: 'This is a test' }));
    });

    test('when updating id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001');
      await assertFails(permissionDocRef.update({ id: 'O002', note: 'This is a test' }));
    });
  });
});

//documentPermissions sub collection
describe('Document Permission Sub Collection Rules Tests', () => {
  const projectId = `doc-permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/C001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('not in org, should not be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O003/documentPermissions/C003');
      await assertFails(permissionDocRef.get());
    });

    test('should be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP01');
      await assertSucceeds(permissionDocRef.set({ id: 'DP01', note: 'This is a create test' }));
    });

    test('id not same as docID, should not be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP02');
      await assertFails(permissionDocRef.set({ id: 'DP00', note: 'This is a create test' }));
    });

    test('docIndex exists, should not be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP03');
      await assertFails(permissionDocRef.set({ note: 'This is a create test for existing docIndex' }));
    });

    test('should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertFails(permissionDocRef.update({ note: 'This is a test' }));
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertSucceeds(permissionDocRef.get());
    });

    test('should be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP01');
      await assertSucceeds(permissionDocRef.set({ id: 'DP01', note: 'This is a create test' }));
    });

    test('id not same as docID, should not be able to create document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/DP02');
      await assertFails(permissionDocRef.set({ id: 'DP00', note: 'This is a create test' }));
    });

    test('changing doc Id, should not be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertFails(permissionDocRef.update({ id: 'P111', note: 'This is a test' }));
    });

    test('should be able to update document', async () => {
      const permissionDocRef = db.doc('permissions/O001/documentPermissions/D001');
      await assertSucceeds(permissionDocRef.update({ note: 'This is a test' }));
    });
  });
});
