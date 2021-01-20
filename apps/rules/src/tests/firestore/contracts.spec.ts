import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';


describe('Contracts Rules Tests', () => {
  const projectId = `ctrules-spec-${Date.now()}`;
  let db: Firestore;

  //User may not be in same org but could be party to the contract 
  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Contracts', () => {
      it('should be able to read contract if party to it', async () => {
        const contractRef = db.doc('contracts/C001');
        await assertSucceeds(contractRef.get());
      });

      it('should be able to read contract if org has permission', async () => {
        const contractRef = db.doc('contracts/C001');
        await assertSucceeds(contractRef.get());
      });

      it('should not be able to read contract', async () => {
        const contractRef = db.doc('contracts/C002');
        await assertFails(contractRef.get());
      });
    });

  });

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Contracts', () => {
      it('should be able to read contract', async () => {
        const contractRef = db.doc('contracts/C001');
        await assertSucceeds(contractRef.get());
      });
    });

    describe('Version', () => {
      //TODO: This test is currently failing
      // It will be fixed for the new rewrite.
      it.skip('contract party should be able to read version doc', async () => {
        const contractRef = db.doc('contracts/C001/version/v1');
        await assertFails(contractRef.get());
      });

      it('should not be able to write to version doc', async () => {
        const contractRef = db.doc('contracts/C001/version/v1');
        await assertFails(contractRef.set({notes: 'modified'}));
      });
    });
  });

});

describe('Public Contracts Rules Tests', () => {
  const projectId = `pctrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    it('user should be able to read contract', async () => {
      const contractRef = db.doc('publicContracts/PC01');
      await assertSucceeds(contractRef.get());
    });

    it('user should not be able to delete contract', async () => {
      const contractRef = db.doc('publicContracts/PC01');
      await assertFails(contractRef.delete());
    });
  });
});