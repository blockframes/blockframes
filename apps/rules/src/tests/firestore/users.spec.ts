import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/unit-tests';

describe('Org Admin', () => {
  const projectId = `usrules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-admin', firebase: { sign_in_provider: 'password' } });
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
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
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
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should allow user to read own user doc (own uid)', async () => {
    const usersRef = db.doc('users/uid-user2');
    await assertSucceeds(usersRef.get({}));
  });

  test('user should be able to list all users', async () => {
    const allDocs = db.collection('users');
    await assertSucceeds(allDocs.get());
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

describe('With Anonymous user', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
     db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8-anon', firebase: { sign_in_provider: 'anonymous' } });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should not be able to list all users', async () => {
    const allDocs = db.collection('users');
    await assertFails(allDocs.get());
  });

  test('should be able to fetch an user by ID', async () => {
    const docRef = db.doc('users/uid-c8');
    await assertSucceeds(docRef.get());
  });

});

