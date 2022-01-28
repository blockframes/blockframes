import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { metaDoc } from '@blockframes/utils/maintenance';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';

describe('Blockframe In Maintenance', () => {
  const projectId = `bfrules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    testFixture[metaDoc].endedAt = null;
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-bfAdmin' });
  });

  afterAll(() => {
    Promise.all(apps().map((app) => app.delete()));
    testFixture[metaDoc].endedAt = true;
  });

  test('Everyone (incl. bf admin) should be able to read MAINTENANCE doc', async () => {
    const maintRef = db.doc(metaDoc);
    await assertSucceeds(maintRef.get());
  });

  test("In maintenance, even blockframe admin shouldn't be able to read admin user", async () => {
    const adminRef = db.doc('blockframesAdmin/uid-bfAdmin');
    await assertFails(adminRef.get());
  });

  test("In maintenance, even blockframe admin shouldn't be able to read a org", async () => {
    const orgRef = db.doc('orgs/O001');
    await assertFails(orgRef.get());
  });

  test("In maintenance, even blockframe admin shouldn't be able to read all users", async () => {
    const usersRef = db.collection('users');
    await assertFails(usersRef.get());
  });
});

describe('Blockframe Not In Maintenance', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-bfAdmin' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('Blockframe admin should be able to read admin user', async () => {
    const adminRef = db.doc('blockframesAdmin/uid-bfAdmin');
    await assertSucceeds(adminRef.get());
  });

  test('Blockframe admin should be able be able to read a org', async () => {
    const orgRef = db.doc('orgs/O001');
    await assertSucceeds(orgRef.get());
  });

  test('Blockframe admin should be able to read all users', async () => {
    const usersRef = db.collection('users');
    await assertSucceeds(usersRef.get());
  });
});
