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

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });
});

describe.only('Public Contracts Rules Tests', () => {
  const projectId = `pctrules-spec-${Date.now()}`;
  let db: Firestore;

  describe.skip('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });

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