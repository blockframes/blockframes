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


describe.only('Movies Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    const newMovieTitle = 'MI-007'
    const newMovieDetails = {id: `${newMovieTitle}`};

    beforeAll(async () => {
      db  = initFirestoreApp(projectId, {uid: 'uid-user2'});
      await setRules(projectId, 'firestore.test.rules');
      await setData(db, testFixture);
      await setRules(projectId, 'firestore.rules');
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("user with valid org should be able to read movie title", async () => {
      const movieRef = db.doc("movies/M001");
      await assertSucceeds(movieRef.get());
    });

    test("user with valid org should be able to read movie distribution rights", async () => {
      const movieDRRef = db.doc("movies/M001/distributionRights/DR001");
      await assertSucceeds(movieDRRef.get());
    });

    test("user valid org, storestatus other than draft should not be able to create movie", async () => {
      const movieRef = db.doc(`movies/${newMovieTitle}`);
      let createdMovie:any = { ...newMovieDetails, storeConfig: {}};
      createdMovie.storeConfig['status'] = 'released';
      await assertFails(movieRef.set(createdMovie));
    });

    test("user valid org, without create permission for org should not be able to create movie", async () => {
      const newMovieTitleUnavailable = 'MI-000';
      const movieRef = db.doc(`movies/${newMovieTitleUnavailable}`);
      let createdMovie:any = { ...newMovieDetails, storeConfig: {}};
      createdMovie.storeConfig['status'] = 'draft';
      await assertFails(movieRef.set(createdMovie));
    });

    test("user valid org, with create permission for org, invalid id should not be able to create movie", async () => {
      const movieRef = db.doc(`movies/${newMovieTitle}`);
      const movieDetails = {id: 'MI-000', storeConfig: {}}
      let createdMovie:any = { ...newMovieDetails, ...movieDetails };
      createdMovie.storeConfig['status'] = 'draft';
      await assertFails(movieRef.set(createdMovie));
    });

    test("user valid org, with create permission for org should be able to create movie", async () => {
      const movieRef = db.doc(`movies/${newMovieTitle}`);
      const movieDetailsOther = {storeConfig: {status: 'draft'}}
      let createdMovie:any = { ...newMovieDetails, ...movieDetailsOther};
      await assertSucceeds(movieRef.set(createdMovie));
    });

  });

  describe('With User not in org', () => {
    const newMovieTitle = 'MI-007'
    const newMovieDetails = {id: `${newMovieTitle}`};

    beforeAll(async () => {
      db  = initFirestoreApp(projectId, {uid: 'uid-peeptom'});
      await setRules(projectId, 'firestore.test.rules');
      await setData(db, testFixture);
      await setRules(projectId, 'firestore.rules');
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("user without valid org shouldn't be able to read movie title", async () => {
      const movieRef = db.doc("movies/M001");
      await assertFails(movieRef.get());
    });

    test("user without valid org shouldn't be able to create movie title", async () => {
      const movieRef = db.doc(`movies/${newMovieTitle}`);
      await assertFails(movieRef.set(newMovieDetails));
    });

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

//TODO: 4201
describe.skip('Events Rules Tests', () => {
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

//TODO: 4187
describe.skip('Campaign Security Rules', () => {

  beforeAll(async () => {

  });

  test("should allow signed-in user to read", async () => {


  });
});
