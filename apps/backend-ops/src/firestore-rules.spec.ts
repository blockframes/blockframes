import { apps, assertFails, assertSucceeds, initializeTestApp, 
        loadFirestoreRules, firestore } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';

type Firestore = ReturnType<typeof initFirestoreApp>;

//TODO : Refactor initFirestoreApp to use better method to update firestore data
//Issue : 4192
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
function setRules(projectId: string, rulePath: string) {
  // Apply the firestore rules to the project
  return loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(rulePath, "utf8")
  });
}

function setData(db: Firestore, dataDB: Record<string, Object>) {
  // Write data to firestore app
  const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
  return Promise.all(promises);
}

describe('Blockframe Admin', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-c8'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("should allow blockframe admin to read", async () => {
    const usersRef = db.collection("users");
    await assertSucceeds(usersRef.get());
  });

});

describe('General User', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
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
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
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
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
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
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
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
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

//TODO: 4198
describe.skip('Permission Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

//TODO: 4199
describe.skip('Movies Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test ", async () => {

  });
});

//TODO: 4200
describe.skip('Contracts Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
    await setRules(projectId, 'firestore.test.rules');
    await setData(db, testFixture);
    await setRules(projectId, 'firestore.rules');
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

describe.only('Events Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {

    beforeAll(async () => {
      db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
      await setRules(projectId, 'firestore.test.rules');
      await setData(db, testFixture);
      await setRules(projectId, 'firestore.rules');
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("user with valid org should be able to read event", async () => {
      const eventRef = db.doc("events/E001");
      await assertSucceeds(eventRef.get());
    });

    test("user with valid org, invalid event id shouldn't be able to create event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E077'};
      await assertFails(eventRef.set(eventDetails));
    });

    test("user with valid org, invalid ownerId shouldn't be able to create event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E007', ownerId: 'uid-007'};
      await assertFails(eventRef.set(eventDetails));
    });

    test("user with valid org, ownerId as uid should be able to create event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E007', ownerId: 'uid-user2'};
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test("user with valid org, ownerId as orgId should be able to create event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E007', ownerId: 'O001'};
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test("user with valid org, ownerId as orgId, modifying id shouldn't be able to update event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E008'};
      await assertFails(eventRef.update(eventDetails));
    });

    test("user with valid org, ownerId as orgId should be able to update event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {notes: 'Unit Test'};
      await assertSucceeds(eventRef.update(eventDetails));
    });

    test("user with valid org, ownerId as orgId should be able to delete event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E007', ownerId: 'O001'};
      await assertSucceeds(eventRef.delete());
    });
  });

  describe('With User not in org', () => {

    beforeAll(async () => {
      db  = initFirestoreApp(projectId, {uid: 'uid-peeptom'});
      await setRules(projectId, 'firestore.test.rules');
      await setData(db, testFixture);
      await setRules(projectId, 'firestore.rules');
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("user without valid org shouldn't be able to read event", async () => {
      const eventRef = db.doc("events/E001");
      await assertFails(eventRef.get());
    });

    test("user without valid org shouldn't be able to create event", async () => {
      const eventRef = db.doc("events/E007");
      const eventDetails = {id: 'E007'};
      await assertFails(eventRef.set(eventDetails));
    });

    test("user without valid org shouldn't be able to update event", async () => {
      const eventRef = db.doc("events/E001");
      const eventDetails = {notes: 'Unit Test'};
      await assertFails(eventRef.update(eventDetails));
    });

    test("user without valid org shouldn't be able to delete event", async () => {
      const eventRef = db.doc("events/E001");
      await assertFails(eventRef.delete());
    });
  });

});

//TODO: 4187
describe.skip('Campaign Security Rules', () => {

  beforeAll(async () => {

  });

  test("should allow signed-in user to read", async () => {


  });
});
