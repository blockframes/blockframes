import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe.skip('Organization Rules Tests', () => {
  const projectId = `orgrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org non-Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001');
      await assertSucceeds(cartDocRef.get());
    });

    test('doc status: pending, should be able to create document', async () => {
      const cartDocRef = db.doc('orgs/O005');
      await assertSucceeds(cartDocRef.set({status: 'pending'}));
    });

    test('should not be able to update document', async () => {
      const cartDocRef = db.doc('orgs/O001');
      await assertFails(cartDocRef.update({note : 'document updated'}));
    });
    
    test('should not be able to delete document', async () => {
      const cartDocRef = db.doc('orgs/O001');
      await assertFails(cartDocRef.delete());
    });
  });

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertSucceeds(orgDocRef.get());
    });

    test('id ≠ orgId, should not be able to create document', async () => {
      const orgDocRef = db.doc('orgs/O004');
      await assertFails(orgDocRef.set({id: 'O005'}));
    });

    test('id == orgId & status: pending, should be able to create document', async () => {
      //Note: O005 is created with non-member, so we need a different Org here.
      const orgDocRef = db.doc('orgs/O006');
      await assertSucceeds(orgDocRef.set({id: 'O006', status: 'pending'}));
    });

    test('should not be able to delete document', async () => {
      const orgDocRef = db.doc('orgs/O001');
      await assertFails(orgDocRef.delete());
    });

    describe('Update Org', () => {
      const existingOrg = 'O003';
      const fields: any = [
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
        await assertSucceeds(orgRef.update({note : 'document updated'}));
      });
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

    describe('Update Org', () => {
      const existingOrg = 'O003';
      const fields: any = [
        ['id', 'O004'],
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

      test('updating appAccess with pending status, should be able to update document', async () => {
        const orgRef = db.doc('orgs/O004');
        await assertSucceeds(orgRef.update({appAccess: { festival: true }}));
      });

      test('updating unrestricted field, should be able to update document', async () => {
        const orgRef = db.doc(`orgs/${existingOrg}`);
        await assertSucceeds(orgRef.update({note : 'document updated'}));
      });
    });
  });
});


//Carts sub collection
describe('Carts Sub Collection Rules Tests', () => {
  const projectId = `doc-cartrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org non-Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should not be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertFails(cartDocRef.get());
    });

    test('should not be able to create document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertFails(cartDocRef.set({id: 'C002'}));
    });

    test('should not be able to update document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertFails(cartDocRef.update({note : 'document updated'}));
    });
    
    test('should not be able to delete document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertFails(cartDocRef.delete());
    });
  });

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertSucceeds(cartDocRef.get());
    });
    
    test('should be able to create document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertSucceeds(cartDocRef.set({id: 'C002'}));
    });

    test('should be able to update document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertSucceeds(cartDocRef.update({note : 'document updated'}));
    });

    test('should not be able to delete document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertFails(cartDocRef.delete());
    });
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should be able to read document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertSucceeds(cartDocRef.get());
    });

    test('should be able to create document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertSucceeds(cartDocRef.set({id: 'C002'}));
    });

    test('should be able to update document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C002');
      await assertSucceeds(cartDocRef.update({note : 'document updated'}));
    });

    test('should be able to delete document', async () => {
      const cartDocRef = db.doc('orgs/O001/carts/C001');
      await assertSucceeds(cartDocRef.delete());
    });
  });
});