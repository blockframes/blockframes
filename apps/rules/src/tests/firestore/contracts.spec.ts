import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
//import { Contract } from '@blockframes/contract/+state';

describe('Contracts Rules Tests', () => {
  const projectId = `ctrules-spec-${Date.now()}`;
  let db: Firestore;

  describe.only('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    describe('Read Contracts', () => {
      test('should be able to read contract if party to it', async () => {
        const contractRef = db.doc('contracts/C001');
        await assertSucceeds(contractRef.get());
      });

      test('should be able to read contract if org has permission', async () => {
        const contractRef = db.doc('contracts/C001');
        await assertSucceeds(contractRef.get());
      });

      test('should not be able to read contract', async () => {
        const contractRef = db.doc('contracts/C002');
        await assertFails(contractRef.get());
      });
    });

    describe.skip('Update Contracts', () => {
      test('should be able to read movie', async () => {
        const movieRef = db.doc('movies/M001');
        await assertSucceeds(movieRef.get());
      });

      test('should be able to read movie distribution rights', async () => {
        const movieDRRef = db.doc('movies/M001/distributionRights/DR001');
        await assertSucceeds(movieDRRef.get());
      });
    });    
  });

  describe.only('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });

});

describe.skip('Public Contracts Rules Tests', () => {
  const projectId = `pctrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user should be able to read contract', async () => {
      const contractRef = db.doc('publicContracts/PC01');
      await assertSucceeds(contractRef.get());
    });

    test('user should not be able to delete contract', async () => {
      const contractRef = db.doc('publicContracts/PC01');
      await assertFails(contractRef.delete());
    });
  });
});