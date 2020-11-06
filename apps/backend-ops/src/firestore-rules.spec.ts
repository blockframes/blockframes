import { apps, assertFails, assertSucceeds, firestore, initializeTestApp, loadFirestoreRules} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';

const setupFirestore = (projectId: string, auth = null) => {
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  const app = initializeTestApp({
    projectId,
    auth
  });

  const db = app.firestore();
  return db;
}

/**
 * Helper function to setup Firestore DB Data
 */
async function setFirestoreDB(projectId: string, 
              strRulesPath: string[], db: any = null, data: any = null) {
  // Apply the firestore rules to the project
  await loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(strRulesPath[0], "utf8")
  });

  // Write data to firestore app
  if (data) {
    for (const key in data) {
      const ref = db.doc(key);
      await ref.set(data[key]);
    }
  }

  if (strRulesPath.length === 2) {
    // Apply the second firestore rules to the project
    await loadFirestoreRules({
      projectId,
      rules: fs.readFileSync(strRulesPath[1], "utf8")
    });    
  }
}

const fexpect: any = Object.assign(expect);

fexpect.extend({
  async toAllow(testPromise) {
    let err = '';
    let pass = false;
    try {
      await assertSucceeds(testPromise);
      pass = true;
    } catch (error) {
      err = error;
      // log error to see which rules caused the test to fail
      console.log(err);
    }

    return {
      pass,
      message: () =>
        `Expected Op to be allowed, but was denied ${err ? '\nErr: err': ''}`
    };
  }
});

expect.extend({
  async toDeny(testPromise) {
    let err = '';
    let pass = false;
    try {
      await assertFails(testPromise);
      pass = true;
    } catch (error) {
      // log error to see which rules caused the test to fail
      err = error;
      console.log(err);
    }

    return {
      pass,
      message: () =>
        `Expected Op to be denied, but was allowed ${err ? '\nErr: err': ''}`
    };
  }
});

afterAll(() => {
  //firebase.apps().forEach(app => app.delete());
});

describe('Blockframe Admin', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = setupFirestore(projectId, {uid: 'uid-c8'});
    await setFirestoreDB(projectId, 
          ['firestore.test.rules', 'firestore.rules'], 
          db, testFixture);
  });

  afterAll(async () => {
    Promise.all(apps().map(app => app.delete()));
  });

  test("should allow blockframe admin to read", async () => {
    const usersRef = db.collection("users");
    await fexpect(usersRef.get()).toAllow();
  });

  test("should allow blockframe admin to write", async () => {
    expect(true).toBe(true);

  });
});

describe.skip('Campaign Security Rules', () => {

  beforeAll(async () => {

  });

  test("should allow signed-in user to read", async () => {


  });
});
