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

    test('Should not be able to update waterfall document', async () => {
      const ref = db.doc('waterfall/M001');
      await assertFails(ref.set({ id: 'M001', orgIds: ['O001', 'O003'] }));
    });

    test('Should not be able to change waterfall document id', async () => {
      const ref = db.doc('waterfall/M001');
      await assertFails(ref.set({ id: 'foo' }));
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

    test('Should not be able to change block document id', async () => {
      const ref = db.doc('waterfall/M001/blocks/B001');
      await assertFails(ref.set({ id: 'B002' }));
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
    test('Should be able to create his own permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O001');
      await assertSucceeds(ref.set({ id: 'O001', roles: ['author'] }));
    });

    test('Should not be able to create others permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.set({ id: 'O003', roles: ['financier'] }));
    });

    test('Should not be able to update permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.set({ id: 'O003', roles: ['financier'], scope: ['O001'] }));
    });

    test('Should not be able to change permissions document id', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.set({ id: 'O002' }));
    });

    test('Should not be able to read permissions document', async () => {
      const ref = db.doc('waterfall/M001/permissions/O003');
      await assertFails(ref.get());
    });

    test('Should not be able to list permissions documents', async () => {
      const ref = db.collection('waterfall/M001/permissions');
      await assertFails(ref.get());
    });
  });

  describe('Documents', () => {
    // TODO #9389
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

  describe('Movies', () => {
    test('Should not be able to update movie document', async () => {
      const ref = db.doc('movies/M001');
      await assertFails(ref.set({ id: 'M001', notes: 'unit test update' }));
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
      await assertFails(ref.set({ id: 'O003', roles: ['financier'] }));
    });

    test('Should not be able to update permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O003');
      await assertFails(ref.set({ id: 'O003', roles: ['financier'], scope: ['O001'] }));
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

  describe('Documents', () => {
    // TODO #9389
  });

});

describe('User that is linked to waterfall but not producer', () => {
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

  describe('Movies', () => {
    test('Should be able to update movie document', async () => {
      const ref = db.doc('movies/MI-0d7');
      await assertSucceeds(ref.set({ id: 'MI-0d7', notes: 'unit test update' }));
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
      const ref = db.doc('waterfall/MI-077/permissions/O002');
      await assertFails(ref.set({ id: 'O002', roles: ['financier'] }));
    });

    test('Should not be able to update permissions document', async () => {
      const ref = db.doc('waterfall/MI-0d7/permissions/O002');
      await assertFails(ref.set({ id: 'O002', roles: ['financier'], scope: ['O001'] }));
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

  describe('Documents', () => {
    // TODO #9389
  });
});

describe('User that is linked to waterfall with producer role', () => {
  const projectId = `waterfall-rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  describe('Waterfall', () => {

    test('Should be able to read waterfall document', async () => {
      const ref = db.doc('waterfall/WF-001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to query waterfall documents', async () => {
      const ref = db.collection('waterfall').where('orgIds', 'array-contains', 'O001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to update waterfall document', async () => {
      const ref = db.doc('waterfall/WF-001');
      await assertSucceeds(ref.set({ id: 'WF-001', notes: 'updated by unit test' }));
    });

    test('Should not be able to change waterfall document id', async () => {
      const ref = db.doc('waterfall/WF-001');
      await assertFails(ref.set({ id: 'foo' }));
    });
  });

  describe('Blocks', () => {
    test('Should be able to create block document', async () => {
      const ref = db.doc('waterfall/WF-001/blocks/B002');
      await assertSucceeds(ref.set({ id: 'B002', actions: {} }));
    });

    test('Should be able to update block document', async () => {
      const ref = db.doc('waterfall/WF-001/blocks/B001');
      await assertSucceeds(ref.set({ id: 'B001', actions: { 1: { name: 'init' } } }));
    });

    test('Should not be able to change block document id', async () => {
      const ref = db.doc('waterfall/WF-001/blocks/B001');
      await assertFails(ref.set({ id: 'B002' }));
    });

    test('Should be able to read block document', async () => {
      const ref = db.doc('waterfall/WF-001/blocks/B001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to list block documents', async () => {
      const ref = db.collection('waterfall/WF-001/blocks');
      await assertSucceeds(ref.get());
    });
  });

  describe('Documents', () => {
    // TODO #9389
  });

  describe('Permissions', () => {
    test('Should be able to create permissions document', async () => {
      const ref = db.doc('waterfall/WF-001/permissions/O003');
      await assertSucceeds(ref.set({ id: 'O003', roles: ['financier'] }));
    });

    test('Should be able to update permissions document', async () => {
      const ref = db.doc('waterfall/WF-001/permissions/foo');
      await assertSucceeds(ref.set({ id: 'foo', roles: ['producer', 'financier'] }));
    });

    test('Should not be able to change permissions document id', async () => {
      const ref = db.doc('waterfall/WF-001/permissions/O001');
      await assertFails(ref.set({ id: 'O002' }));
    });

    test('Should be able to read permissions document', async () => {
      const ref = db.doc('waterfall/WF-001/permissions/foo');
      await assertSucceeds(ref.get());
    });

    test('Should be able to list permissions documents', async () => {
      const ref = db.collection('waterfall/WF-001/permissions');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to read permissions document if not producer anymore', async () => {
      const ref1 = db.doc('waterfall/WF-001/permissions/foo');
      await assertSucceeds(ref1.get());

      // Self remove producer role
      const ref2 = db.doc('waterfall/WF-001/permissions/O001');
      await assertSucceeds(ref2.set({ id: 'O001', roles: ['financier'] }));

      const ref3 = db.doc('waterfall/WF-001/permissions/foo');
      await assertFails(ref3.get());

    });
  });

});

