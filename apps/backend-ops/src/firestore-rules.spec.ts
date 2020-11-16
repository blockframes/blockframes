import { apps, assertFails, assertSucceeds, initializeTestApp, 
        loadFirestoreRules, firestore, initializeAdminApp } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';
import { TokenOptions,  } from '@firebase/rules-unit-testing/dist/src/api';
import { firestore } from 'firebase-admin';

//type Firestore = ReturnType<typeof initFirestoreApp> //<-- does not work!

async function initFirestoreApp(projectId: string, rulePath: string, data: Record<string, 
                                  Object> = {}, auth?: TokenOptions) {
  //Define these env vars to avoid getting console warnings
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  await setData(projectId, data);
  const app = initializeTestApp({projectId, auth });
  await loadFirestoreRules({ projectId, rules: fs.readFileSync(rulePath, "utf8") });

  return app.firestore();
}


/**
 * Helper function to setup Firestore DB Data
 */
function setRules(projectId: string, rulePath: string) {
  // Apply the firestore rules to the project
  return loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(rulePath, "utf8")
  });
}

function setData(projectId: string, dataDB: Record<string, Object>) {
  const app = initializeAdminApp({ projectId});
  const db = app.firestore();
  // Write data to firestore app
  const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
  return Promise.all(promises);
}

describe('Blockframe Admin', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: firebase.firestore.Firestore;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-c8'});
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
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should not allow user to write /blockframesAdmin/user", async () => {
    const usersRef = db.doc("blockframesAdmin/007");
    await assertFails(usersRef.set({uid: '007'}));
  });
});

describe('Users Collection Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  const uid = 'uid-user2';
  const user = {uid, email: 'u2@cascade8.com', note: 'JestTestSet-User2'};
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should allow user to read own user doc (own uid)", async () => {
    const usersRef = db.doc("users/uid-user2");
    await assertSucceeds(usersRef.get({}));
  });

  test("should allow user to delete own user doc (own uid)", async () => {
    const usersRef = db.doc("users/uid-user2");
    await assertSucceeds(usersRef.delete());
  });

  test("shouldn't allow user to create own user doc (own uid)", async () => {
    const usersRef = db.doc("users/uid-user2");
    await assertFails(usersRef.set({email: 'u2@cascade8.com', note: 'JestTestSet-User2'}));
  });

  test("should allow user to create own user doc (own uid)", async () => {
    const usersRef = db.doc(`users/${uid}`);
    await assertSucceeds(usersRef.set(user));
  });

  test("should contain exact fields for own user docs", async () => {
    const usersRef = db.doc(`users/${uid}`);
    const expUserSnap = await usersRef.get();
    const expUser = await expUserSnap.data();
    expect(user).toEqual(expUser);
  });

});

//TODO: 4190
describe.skip('Notification Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should not allow user to create notification", async () => {
    const notifRef = db.doc("notifications/001");
    await assertFails(notifRef.set({note: 'A notification'}));
  });
});

//TODO: 4195
describe.skip('Invitation Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should not allow user to create ", async () => {
    const notifRef = db.doc("invitations/001");
    await assertFails(notifRef.set({note: 'A notification'}));
  });
});

//TODO: 4197
describe.skip('Organization Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

//TODO: 4198
describe.skip('Permission Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

//TODO: 4199
describe.skip('Movies Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});

  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test ", async () => {

  });
});

//TODO: 4200
describe.skip('Contracts Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

//TODO: 4201
describe.skip('Events Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: any;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test ", async () => {

  });
});

//TODO: 4187
describe.skip('Campaign Security Rules', () => {

  beforeAll(async () => {

  });

  test("should allow signed-in user to read", async () => {


  });
});
