import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/unit-tests';

describe('Contracts Rules Tests', () => {
  const projectId = `ctrules-spec-${Date.now()}`;
  const buyerId = 'O001';
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
      uid: 'uid-sAdmin',
      firebase: { sign_in_provider: 'password' },
    });
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
});
