﻿import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe('Org Admin', () => {
  const projectId = `usrules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should allow org admin to read', async () => {
    const usersRef = db.collection('users');
    await assertSucceeds(usersRef.get());
  });
});

describe('General User', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should not allow user to write /blockframesAdmin/user', async () => {
    const usersRef = db.doc('blockframesAdmin/007');
    await assertFails(usersRef.set({ uid: '007' }));
  });
});

describe('Users Collection Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  const uid = 'uid-user2';
  const user = { uid, email: 'u2@cascade8.com', note: 'JestTestSet-User2' };
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should allow user to read own user doc (own uid)', async () => {
    const usersRef = db.doc('users/uid-user2');
    await assertSucceeds(usersRef.get({}));
  });

  test('should allow user to delete own user doc (own uid)', async () => {
    const usersRef = db.doc('users/uid-user2');
    await assertSucceeds(usersRef.delete());
  });

  test("shouldn't allow user to create own user doc (own uid)", async () => {
    const usersRef = db.doc('users/uid-user2');
    await assertFails(usersRef.set({ email: 'u2@cascade8.com', note: 'JestTestSet-User2' }));
  });

  test('should allow user to create own user doc (own uid)', async () => {
    const usersRef = db.doc(`users/${uid}`);
    await assertSucceeds(usersRef.set(user));
  });

  test('should contain exact fields for own user docs', async () => {
    const usersRef = db.doc(`users/${uid}`);
    const expUserSnap = await usersRef.get();
    const expUser = await expUserSnap.data();
    expect(user).toEqual(expUser);
  });
});

