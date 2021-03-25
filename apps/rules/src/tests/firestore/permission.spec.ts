﻿import { apps } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';


//TODO: 4198
describe('Permission Rules Tests', () => {
  const projectId = `permrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User as Org Member', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });

  describe('With User as Org Admin', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('test', async () => {});
  });
});
