import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';


describe.skip('Contracts Rules Tests', () => {
  const projectId = `ctrules-spec-${Date.now()}`;
  const orgId = 'O001';
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));
  

  it('[READ] succeed for any org', async () => {
    const isStakeholder = db.doc('contracts/C001');
    const isNotStakeholder = db.doc('contracts/C002');
    await Promise.all([
      assertSucceeds(isStakeholder.get()),
      assertSucceeds(isNotStakeholder.get()),
    ]);
  });

  it('[CREATE] succeed if orgId === contract.orgId', async () => {
    const ref = db.doc('contracts/C003');
    await assertSucceeds(ref.set({ orgId }));
  });

  it('[CREATE] failed if orgId !== contract.orgId', async () => {
    const ref = db.doc('contracts/C004');
    await assertFails(ref.set({ orgId: 'O002' }));
  });

  it('[UPDATE] always fails', async () => {
    const ref = db.doc('contracts/C005');
    await ref.set({ orgId });
    await assertFails(ref.update({ stakeholders: null }));
  });

  it('[DELETE] always fails', async () => {
    const ref = db.doc('contracts/C006');
    await ref.set({ orgId });
    await assertFails(ref.delete());
  });
});