import { apps, assertFails, assertSucceeds } from '@firebase/testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe('Organization Rules Tests', () => {
  const projectId = `orgrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With not logged in user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture);
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should not be able to read document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.get());
    });

    test('should not be able to create document', async () => {
      const orgDocRef = db.doc('orgs/O007');
      await assertFails(orgDocRef.set({ status: 'pending' }));
    });

    test('should not be able to update document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.delete());
    });

    test('not logged in user should not be able to list all orgs', async () => {
      const allDocs = db.collection('orgs');
      await assertFails(allDocs.get());
    });
  });

  describe('With Anonymous user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8-anon', firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const orgDocRef = db.doc('orgs/A001');
      await assertSucceeds(orgDocRef.get());
    });

    test('doc status: pending, should be able to create document', async () => {
      const orgDocRef = db.doc('orgs/A007');
      await assertSucceeds(orgDocRef.set({ status: 'pending' }));
    });

    test('should not be able to update document', async () => {
      const orgDocRef = db.doc('orgs/A001');
      await assertFails(orgDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/A001');
      await assertFails(orgDocRef.delete());
    });

     // @TODO #6908 updated with userHasValidOrg() when a solution for this is found.
    test.skip('should not be able to list all orgs', async () => {
      const allDocs = db.collection('orgs');
      await assertFails(allDocs.get());
    });

    test('should be able to fetch an org by ID', async () => {
      const docRef = db.doc('orgs/O001');
      await assertSucceeds(docRef.get());
    });
  });

  describe('With User as Org non-Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertSucceeds(orgDocRef.get());
    });

    test('should be able to list all orgs', async () => {
      const allDocs = db.collection('orgs');
      await assertSucceeds(allDocs.get());
    });

    test('doc status: pending, should be able to create document', async () => {
      const orgDocRef = db.doc('orgs/O007');
      await assertSucceeds(orgDocRef.set({ status: 'pending' }));
    });

    test('non-member should not be able to update document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.update({ note: 'document updated' }));
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.delete());
    });
  });

  describe('With User as or going to be Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user5', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read own Org document', async () => {
      const orgDocRef = db.doc('orgs/O005');
      await assertSucceeds(orgDocRef.get());
    });

    test('id ≠ orgId, should not be able to create document', async () => {
      const orgDocRef = db.doc('orgs/O0X4');
      await assertFails(orgDocRef.set({ id: 'O0X5' }));
    });

    test('id == orgId & status: pending, should be able to create document', async () => {
      //Note: O007 is created with non-member, so we need a different Org here.
      const orgDocRef = db.doc('orgs/O008');
      await assertSucceeds(orgDocRef.set({ id: 'O008', status: 'pending' }));
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O005');
      await assertFails(orgDocRef.delete());
    });

    describe('Update Org', () => {
      const existingOrg = 'O005';
      const fields: [string, unknown][] = [
        ['id', 'O004'],
        ['userIds', ['uid-sAdmin']],
        ['_meta', { createdBy: '' }],
        ['_meta', { createdAt: '' }],
        ['appAccess', { festival: true }],
        ['email', 'adming@O003.org'],
        ['status', 'dissolved'],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const orgRef = db.doc(`orgs/${existingOrg}`);
        const details = {};
        details[key] = value;
        await assertFails(orgRef.update(details));
      });

      test('updating unrestricted field, should be able to update document', async () => {
        const orgRef = db.doc(`orgs/${existingOrg}`);
        await assertSucceeds(orgRef.update({ note: 'document updated' }));
      });
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin4', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read own Org document', async () => {
      const orgDocRef = db.doc('orgs/O004');
      await assertSucceeds(orgDocRef.get());
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O004');
      await assertFails(orgDocRef.delete());
    });

    describe('Update Org', () => {
      const existingOrg = 'O004';
      const fields: [string, unknown][] = [
        ['id', 'O005'],
        ['_meta', { createdBy: '' }],
        ['_meta', { createdAt: '' }],
        ['appAccess', { festival: true }],
        ['status', 'dissolved'],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const orgRef = db.doc(`orgs/${existingOrg}`);
        const details = {};
        details[key] = value;
        await assertFails(orgRef.update(details));
      });

      test('updating unrestricted field, should be able to update document', async () => {
        const orgRef = db.doc(`orgs/${existingOrg}`);
        await assertSucceeds(orgRef.update({ note: 'document updated' }));
      });
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin6', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    const existingOrg = 'O006';

    test('updating appAccess for org with pending status, should be able to update document', async () => {
      const orgPath = `orgs/${existingOrg}`;
      const orgRef = db.doc(orgPath);
      await assertSucceeds(orgRef.update({ appAccess: { festival: true } }));
    });
  });
});
