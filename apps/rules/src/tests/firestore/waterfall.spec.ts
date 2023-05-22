import { deleteApp, getApps } from 'firebase/app';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';

describe('Movie Owner', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  describe('Waterfall', () => {
    it('Should be able to create waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertSucceeds(ref.set({ id: 'M001', orgIds: ['O001'] }));
    });

    test('Should be able to read waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to list all waterfall documents', async () => {
      const ref = db.collection('waterfall');
      await assertFails(ref.get());
    });

    test('Should be able to query waterfall documents', async () => {
      const ref = db.collection('waterfall').where('orgIds', 'array-contains', 'O001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to update waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertSucceeds(ref.set({ id: 'M001', orgIds: ['O001', 'O003'] }));
    });

    test('Should not be able to change waterfall document id', async () => {
      const ref = db.doc('waterfall/M001');
      await assertFails(ref.set({ id: 'foo' }));
    });
  });

  describe('Blocks', () => {
    test('Should be able to create block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertSucceeds(ref.set({ id: 'B001', actions: {} }));
    });

    test('Should be able to update block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertSucceeds(ref.set({ id: 'B001', actions: { 1: { name: 'init' } } }));
    });

    test('Should not be able to change block document id', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertFails(ref.set({ id: 'B002' }));
    });

    test('Should be able to read block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to list block documents', async () => {
      const ref = db.collection('waterfall/M001/blocks');
      await assertSucceeds(ref.get());
    });
  });

  describe('Permissions', () => {
    test('Should be able to create permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertSucceeds(ref.set({ id: 'O003', role: ['financier'] }));
    });

    test('Should be able to update permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertSucceeds(ref.set({ id: 'O003', role: ['financier'], scope: ['O001'] }));
    });

    test('Should not be able to change permissions document id', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.set({ id: 'O002' }));
    });

    test('Should be able to read permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertSucceeds(ref.get());
    });

    test('Should be able to list permissions documents', async () => {
      const ref = db.collection('waterfall/M001/permissions');
      await assertSucceeds(ref.get());
    });
  });

  describe('Budget', () => {
    test('Should be able to create budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertSucceeds(ref.set({ id: 'M001' }));
    });

    test('Should be able to update budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertSucceeds(ref.set({ id: 'M001', foo:'bar' }));
    });

    test('Should not be able to change budget document id', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertFails(ref.set({ id: 'M00X' }));
    });

    test('Should be able to read budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertSucceeds(ref.get());
    });

  });
});

describe('User that is not owner of movie', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user3', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  describe('Waterfall', () => {
    it('Should not be able to create waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertFails(ref.set({ id: 'M001' }));
    });

    test('Should not be able to read waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertFails(ref.get());
    });

    test('Should not be able to list waterfall documents', async () => {
      const ref = db.collection('waterfall');
      await assertFails(ref.get());
    });
  });

  describe('Blocks', () => {

    test('Should not be able to create block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertFails(ref.set({ id: 'B001', actions: {} }));
    });

    test('Should not be able to update block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertFails(ref.set({ id: 'B001', actions: { 1: { name: 'init' } } }));
    });

    test('Should not be able to read block document', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertFails(ref.get());
    });

    test('Should not be able to list block documents', async () => {
      const ref = db.collection('waterfall/M001/blocks');
      await assertFails(ref.get());
    });
  });

  describe('Permissions', () => {
    test('Should not be able to create permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.set({ id: 'O003', role: ['financier'] }));
    });

    test('Should not be able to update permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O003');
      await assertFails(ref.set({ id: 'O003', role: ['financier'], scope: ['O001'] }));
    });

    test('Should not be able to read permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O003');
      await assertFails(ref.get());
    });

    test('Should not be able to list permissions documents', async () => {
      const ref = db.collection('waterfall/M001/permissions');
      await assertFails(ref.get());
    });
  });

  describe('Budget', () => {
    test('Should not be able to create budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertFails(ref.set({ id: 'M001' }));
    });

    test('Should not be able to update budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertFails(ref.set({ id: 'M001', foo:'bar' }));
    });

    test('Should not be able to read budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertFails(ref.get());
    });
  });

});

describe('User that is linked to waterfall', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user3', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  describe('Waterfall', () => {
    test('Should be able to read waterfall document', async () => {
      const ref = db.doc('waterfall/MI-0d7');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to list all waterfall documents', async () => {
      const ref = db.collection('waterfall');
      await assertFails(ref.get());
    });

    test('Should be able to query waterfall documents', async () => {
      const ref = db.collection('waterfall').where('orgIds', 'array-contains', 'O002');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to update waterfall document', async () => {
      const ref = db.doc('waterfall/MI-0d7');
      await assertFails(ref.set({ id: 'MI-0d7', orgIds: ['O002', 'O003'] }));
    });
  });

  describe('Blocks', () => {
    test('Should not be able to create block document', async () => {
      const ref = db.doc('waterfall/MI-0d7/blocks/B002');
      await assertFails(ref.set({ id: 'B002', actions: {} }));
    });

    test('Should not be able to update block document', async () => {
      const ref = db.doc('waterfall/MI-0d7/blocks/B001');
      await assertFails(ref.set({ id: 'B001', actions: { 1: { name: 'init' } } }));
    });

    test('Should not be able to read block document', async () => {
      const ref = db.doc('waterfall/MI-0d7/blocks/B001');
      await assertFails(ref.get());
    });

    test('Should not be able to list block documents', async () => {
      const ref = db.collection('waterfall/MI-0d7/blocks');
      await assertFails(ref.get());
    });
  });

  describe('Permissions', () => {
    test('Should not be able to create permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O002');
      await assertFails(ref.set({ id: 'O002', role: ['financier'] }));
    });

    test('Should not be able to update permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O002');
      await assertFails(ref.set({ id: 'O002', role: ['financier'], scope: ['O001'] }));
    });

    test('Should be able to read his own permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O002');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to read other permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O003');
      await assertFails(ref.get());
    });

    test('Should not be able to list permissions documents', async () => {
      const ref = db.collection('waterfall/MI-0d7/permissions');
      await assertFails(ref.get());
    });
  });

  describe('Budget', () => {
    test('Should not be able to create budget document', async () => {
      const ref = db.doc('waterfall/M001/budget/M001');
      await assertFails(ref.set({ id: 'M001' }));
    });

    test('Should not be able to update budget document', async () => {
      const ref = db.doc('waterfall/MI-0d7/budget/MI-0d7');
      await assertFails(ref.set({ id: 'MI-0d7', foo:'bar' }));
    });

    test('Should be able to read budget document if org has financier role', async () => {
      const ref = db.doc('waterfall/MI-0d7/budget/MI-0d7');
      await assertSucceeds(ref.get());
    });
  });
});

