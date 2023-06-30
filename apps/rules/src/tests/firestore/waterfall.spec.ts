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
    test('Should be able to create document', async () => {
      const ref = db.doc('waterfall/M001/documents/D002');
      await assertSucceeds(ref.set({ id: 'D002', meta: {} }));
    });

    test('Should not be able to update document', async () => {
      const ref = db.doc('waterfall/M001/documents/D001');
      await assertFails(ref.set({ id: 'D001', meta: { foo: 'bar' } }));
    });

    test('Should not be able to read document', async () => {
      const ref = db.doc('waterfall/M001/documents/D001');
      await assertFails(ref.get());
    });

    test('Should not be able to list documents', async () => {
      const ref = db.collection('waterfall/M001/documents');
      await assertFails(ref.get());
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
    test('Should not be able to create document', async () => {
      const ref = db.doc('waterfall/M001/documents/D003');
      await assertFails(ref.set({ id: 'D003', meta: {} }));
    });

    test('Should not be able to update document', async () => {
      const ref = db.doc('waterfall/M001/documents/D001');
      await assertFails(ref.set({ id: 'D001', meta: { foo: 'bar' } }));
    });

    test('Should not be able to read document', async () => {
      const ref = db.doc('waterfall/M001/documents/D001');
      await assertFails(ref.get());
    });

    test('Should not be able to list documents', async () => {
      const ref = db.collection('waterfall/M001/documents');
      await assertFails(ref.get());
    });
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
    test('Should be able to create document', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D002');
      await assertSucceeds(ref.set({ id: 'D002', ownerId: 'O002', meta: {} }));
    });

    test('Should not be able to read document if not owner or shared with him', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D001');
      await assertFails(ref.get());
    });

    test('Should be able to read document if owner', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D002');
      await assertSucceeds(ref.get());
    });

    test('Should be able to update document if owner', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D002');
      await assertSucceeds(ref.set({ id: 'D002', ownerId: 'O002', meta: { foo: 'bar' } }));
    });

    test('Should not be able to update document if not owner', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D001');
      await assertFails(ref.set({ id: 'D001', ownerId: 'O002', meta: { foo: 'bar' } }));
    });

    test('Should be able to read document if shared with him', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D003');
      await assertSucceeds(ref.get());
    });

    test('Should not be able to update document if shared with him', async () => {
      const ref = db.doc('waterfall/MI-0d7/documents/D003');
      await assertFails(ref.set({ id: 'D003', ownerId: 'O002', meta: { foo: 'bar' } }));
    });

    test('Should not be able to list all documents', async () => {
      const ref = db.collection('waterfall/MI-0d7/documents');
      await assertFails(ref.get());
    });

    test('Should be able to query documents that are shared with him', async () => {
      const ref = db.collection('waterfall/MI-0d7/documents').where('sharedWith', 'array-contains', 'O002');
      await assertSucceeds(ref.get());
    });

    test('Should be able to query documents where he is owner', async () => {
      const ref = db.collection('waterfall/MI-0d7/documents').where('ownerId', '==', 'O002');
      await assertSucceeds(ref.get());
    });

    describe('Incomes', () => {
      test('Should be able to read income linked to a document he can read', async () => {
        const ref = db.doc('incomes/I002');
        await assertSucceeds(ref.get());
      });

      test('Should be able to read income linked to a document that he owns', async () => {
        const ref = db.doc('incomes/I001');
        await assertSucceeds(ref.get());
      });

      test('Should not be able to list all incomes', async () => {
        const ref = db.collection('incomes');
        await assertFails(ref.get());
      });

      test('Should be able to list all incomes linked to a document he owns', async () => {
        const ref = db.collection('incomes').where('contractId', '==', 'D002').where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to list all incomes linked to a document that is shared with him', async () => {
        const ref = db.collection('incomes').where('contractId', '==', 'D003').where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to list all incomes linked to documents he owns or that is shared with him', async () => {
        const ref = db.collection('incomes').where('contractId', 'in', ['D003', 'D002']).where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to create income linked to a document he owns', async () => {
        const ref = db.doc('incomes/I003');
        await assertSucceeds(ref.set({ id: 'I003', price: 150, titleId: 'MI-0d7', contractId: 'D002' }));
      });

      test('Should not be able to create income linked to a document that is shared with him', async () => {
        const ref = db.doc('incomes/I004');
        await assertFails(ref.set({ id: 'I004', price: 150, titleId: 'MI-0d7', contractId: 'D003' }));
      });

      test('Should not be able to update an income linked to a document he can read', async () => {
        const ref = db.doc('incomes/I002');
        await assertFails(ref.set({ id: 'I002', price: 150, titleId: 'MI-0d7', contractId: 'D003' }));
      });

      test('Should be able to update an income linked to a document that he owns', async () => {
        const ref = db.doc('incomes/I003');
        await assertSucceeds(ref.set({ id: 'I003', price: 100, titleId: 'MI-0d7', contractId: 'D002' }));
      });

      test('Should not be able to delete an income linked to a document he can read', async () => {
        const ref = db.doc('incomes/I002');
        await assertFails(ref.delete());
      });

      test('Should be able to delete an income linked to a document that he owns', async () => {
        const ref = db.doc('incomes/I003');
        await assertSucceeds(ref.delete());
      });
    });

    describe('Expenses', () => {
      test('Should be able to read expense linked to a document he can read', async () => {
        const ref = db.doc('expenses/E002');
        await assertSucceeds(ref.get());
      });

      test('Should be able to read expense linked to a document that he owns', async () => {
        const ref = db.doc('expenses/E001');
        await assertSucceeds(ref.get());
      });

      test('Should not be able to list all expenses', async () => {
        const ref = db.collection('expenses');
        await assertFails(ref.get());
      });

      test('Should be able to list all expenses linked to a document he owns', async () => {
        const ref = db.collection('expenses').where('contractId', '==', 'D002').where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to list all expenses linked to a document that is shared with him', async () => {
        const ref = db.collection('expenses').where('contractId', '==', 'D003').where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to list all expenses linked to documents he owns or that is shared with him', async () => {
        const ref = db.collection('expenses').where('contractId', 'in', ['D003', 'D002']).where('titleId', '==', 'MI-0d7');
        await assertSucceeds(ref.get());
      });

      test('Should be able to create expense linked to a document he owns', async () => {
        const ref = db.doc('expenses/E003');
        await assertSucceeds(ref.set({ id: 'E003', price: 150, titleId: 'MI-0d7', contractId: 'D002' }));
      });

      test('Should not be able to create expense linked to a document that is shared with him', async () => {
        const ref = db.doc('expenses/E004');
        await assertFails(ref.set({ id: 'E004', price: 150, titleId: 'MI-0d7', contractId: 'D003' }));
      });

      test('Should not be able to update an expense linked to a document he can read', async () => {
        const ref = db.doc('expenses/E002');
        await assertFails(ref.set({ id: 'E002', price: 150, titleId: 'MI-0d7', contractId: 'D003' }));
      });

      test('Should be able to update an expense linked to a document that he owns', async () => {
        const ref = db.doc('expenses/E003');
        await assertSucceeds(ref.set({ id: 'E003', price: 100, titleId: 'MI-0d7', contractId: 'D002' }));
      });

      test('Should not be able to delete an expense linked to a document he can read', async () => {
        const ref = db.doc('expenses/E002');
        await assertFails(ref.delete());
      });

      test('Should be able to delete an expense linked to a document that he owns', async () => {
        const ref = db.doc('expenses/E003');
        await assertSucceeds(ref.delete());
      });
    });
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
      await assertSucceeds(ref.set({ id: 'WF-001', orgIds: ['O001'], notes: 'updated by unit test' }));
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
    test('Should be able to create document', async () => {
      const ref = db.doc('waterfall/WF-001/documents/D002');
      await assertSucceeds(ref.set({ id: 'D002', meta: {} }));
    });

    test('Should be able to update document', async () => {
      const ref = db.doc('waterfall/WF-001/documents/D001');
      await assertSucceeds(ref.set({ id: 'D001', meta: { foo: 'bar' } }));
    });

    test('Should be able to read document', async () => {
      const ref = db.doc('waterfall/WF-001/documents/D001');
      await assertSucceeds(ref.get());
    });

    test('Should be able to list documents', async () => {
      const ref = db.collection('waterfall/WF-001/documents');
      await assertSucceeds(ref.get());
    });
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

