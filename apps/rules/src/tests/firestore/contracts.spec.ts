import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteApp, getApps } from 'firebase/app';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';

describe('Contracts Rules Tests', () => {
  const projectId = `ctrules-spec-${Date.now()}`;
  const buyerId = 'O001';
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-sAdmin', { firebase: { sign_in_provider: 'password' } });
  });

  afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

  // CONTRACTS

  it('[READ] succeed for any org', async () => {
    const isStakeholder = db.doc('contracts/C001');
    const isNotStakeholder = db.doc('contracts/C002');
    await Promise.all([
      assertSucceeds(isStakeholder.get()),
      assertSucceeds(isNotStakeholder.get()),
    ]);
  });

  it('[CREATE] succeed if orgId === contract.buyerId', async () => {
    const ref = db.doc('contracts/C003');
    await assertSucceeds(ref.set({ buyerId }));
  });

  it('[CREATE] failed if orgId !== contract.buyerId', async () => {
    const ref = db.doc('contracts/C004');
    await assertFails(ref.set({ buyerId: 'O002' }));
  });

  it('[UPDATE] always fails', async () => {
    const ref = db.doc('contracts/C005');
    await ref.set({ buyerId });
    await assertFails(ref.update({ stakeholders: null }));
  });

  it('[DELETE] always fails', async () => {
    const ref = db.doc('contracts/C006');
    await ref.set({ buyerId });
    await assertFails(ref.delete());
  });

  // TERMS
  it('[CREATE] can create terms if orgId === contract.buyerId', async () => {
    const ref = db.doc('terms/T001');
    await assertSucceeds(ref.set({ id: 'T001', contractId: 'W001' }));
  });

  it('[CREATE] can create terms if orgId === contract.sellerId', async () => {
    const ref = db.doc('terms/T002');
    await assertSucceeds(ref.set({ id: 'T002', contractId: 'W002' }));
  });

  it('[UPDATE] can not update terms if orgId === contract.buyerId', async () => {
    const ref = db.doc('terms/T001');
    await assertFails(ref.update({ id: 'T003', foo: 'bar' }));
  });

  it('[UPDATE] can update terms if orgId === contract.sellerId', async () => {
    const ref = db.doc('terms/T002');
    await assertSucceeds(ref.update({ id: 'T004', foo: 'bar' }));
  });

  test('[LIST] Should be able to list terms', async () => {
    const ref = db.collection('terms');
    await assertSucceeds(ref.get());
  });

  // INCOMES
  it('[CREATE] can create incomes if orgId === contract.buyerId', async () => {
    const ref = db.doc('incomes/I014');
    await assertSucceeds(ref.set({ id: 'I014', contractId: 'W001' }));
  });

  it('[CREATE] can not create incomes if orgId === contract.sellerId', async () => {
    const ref = db.doc('incomes/I015');
    await assertFails(ref.set({ id: 'I015', contractId: 'W002' }));
  });

  it('[UPDATE] can not update incomes if orgId === contract.buyerId', async () => {
    const ref = db.doc('incomes/I00X');
    await assertFails(ref.update({ id: 'I00X', foo: 'bar' }));
  });

  it('[UPDATE] can not update incomes if orgId === contract.sellerId', async () => {
    const ref = db.doc('incomes/I013');
    await assertFails(ref.update({ id: 'I013', foo: 'bar' }));
  });

  it('[DELETE] always fails', async () => {
    const ref = db.doc('incomes/I014');
    await assertFails(ref.delete());
  });

  test('[LIST] Should not be able to list incomes', async () => {
    const ref = db.collection('incomes');
    await assertFails(ref.get());
  });

  it('[READ] Should be able to get income where orgId in stakeholders', async () => {
    const isStakeholder = db.doc('incomes/I016');
    await assertSucceeds(isStakeholder.get());
  });
});
