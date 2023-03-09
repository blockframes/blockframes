import { deleteApp, getApps } from 'firebase/app';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture  } from '@blockframes/testing/unit-tests';

describe('Movie Owner', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  it('Should be able to create waterfall document', async () => {
    const ref = db.doc('waterfall/M001');
    await assertSucceeds(ref.set({ id: 'M001', orgIds: ['O001'] }));
  });

  test('Should be able to read waterfall document', async () => {
    const ref = db.doc('waterfall/M001');
    await assertSucceeds(ref.get());
  });

  test('Should be able to update waterfall document', async () => {
    const ref = db.doc('waterfall/M001');
    await assertSucceeds(ref.set({ id: 'M001', orgIds: ['O001','O003'], }));
  });

  test('Should not be able to update waterfall document id', async () => {
    const ref = db.doc('waterfall/M001');
    await assertFails(ref.set({ id: 'foo', orgIds: ['O001'], }));
  });

  test('Should be able to read block documents', async () => {
    const usersRef = db.collection('waterfall/M001/blocks');
    await assertSucceeds(usersRef.get());
  });

});

describe('User that is not owner of movie', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user3', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  it('Should not be able to create waterfall document', async () => {
    const ref = db.doc('waterfall/M001');
    await assertFails(ref.set({ id: 'M001' }));
  });

  test('Should not be able to read waterfall document', async () => {
    const ref = db.doc('waterfall/M001');
    await assertFails(ref.get());
  });

  test('Should not be able to read block documents', async () => {
    const ref = db.collection('waterfall/M001/blocks');
    await assertFails(ref.get());
  });

});

describe('User that is linked to waterfall', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user3', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  test('Should be able to read waterfall document', async () => {
    const ref = db.doc('waterfall/MI-0d7');
    await assertSucceeds(ref.get());
  });

  test('Should not be able to update waterfall document', async () => {
    const ref = db.doc('waterfall/MI-0d7');
    await assertFails(ref.set({ id: 'MI-0d7', orgIds: ['O002','O003'], }));
  });

  test('Should not be able to read block documents', async () => {
    const ref = db.collection('waterfall/M001/blocks');
    await assertFails(ref.get());
  });

});

