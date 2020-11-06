import { apps, assertFails, assertSucceeds, initializeTestApp, 
        loadFirestoreRules } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';

const initFirestoreApp = (projectId: string, auth?: any) => {
  //Define these env vars to avoid getting console warnings
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  const app = initializeTestApp({
    projectId,
    auth
  });

  return app.firestore();
}

/**
 * Helper function to setup Firestore DB Data
 */
async function setFirestore(projectId: string, rulePath: string, db?: any, dataDB?: Object) {
  // Apply the firestore rules to the project
  await loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(rulePath, "utf8")
  });

  // Write data to firestore app
  if (dataDB) {
    for (const key in dataDB) {
      const ref = db.doc(key);
      await ref.set(dataDB[key]);
    }
  }
}

describe('Blockframe Admin', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-c8'});
    await setFirestore(projectId, 'firestore.test.rules', db, testFixture);
    await setFirestore(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should allow blockframe admin to read", async () => {
    const usersRef = db.collection("users");
    await assertSucceeds(usersRef.get());
  });

});

describe('General User', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setFirestore(projectId, 'firestore.test.rules', db, testFixture);
    await setFirestore(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should not allow user to write /blockframesAdmin/user", async () => {
    const usersRef = db.doc("blockframesAdmin/007");
    await assertFails(usersRef.set({uid: '007'}));
  });
});

describe.skip('Campaign Security Rules', () => {

  beforeAll(async () => {

  });

  test("should allow signed-in user to read", async () => {


  });
});
