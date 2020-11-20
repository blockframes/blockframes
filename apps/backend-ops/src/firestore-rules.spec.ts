import { apps, assertFails, assertSucceeds, initializeTestApp,
        loadFirestoreRules, initializeAdminApp } from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import fs from 'fs';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';
import { Movie } from '@blockframes/movie/+state'
import { MovieAppAccess } from '@blockframes/utils/apps';
import { StoreStatus, StoreType } from '@blockframes/utils/static-model';

type ExtractPromise<T> = T extends Promise<(infer I)> ? I : never;
type PromiseFirestore = ReturnType<typeof initFirestoreApp>;
type Firestore = ExtractPromise<PromiseFirestore>

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

function setData(projectId: string, dataDB: Record<string, Object>) {
  const app = initializeAdminApp({ projectId});
  const db = app.firestore();
  // Write data to firestore app
  const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
  return Promise.all(promises);
}

describe('Blockframe In Maintenance', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    testFixture["_META/_MAINTENANCE"].endedAt = null;
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-bfAdmin'});
  });

  afterAll(() => { 
    Promise.all(apps().map(app => app.delete()));
    testFixture["_META/_MAINTENANCE"].endedAt = true;
  });

  test("Everyone (incl. bf admin) should be able to read MAINTENANCE doc", async () => {
    const maintRef = db.doc("_META/_MAINTENANCE");
    await assertSucceeds(maintRef.get());
  });

  test("In maintenance, even super admin shouldn't be able to read admin user", async () => {
    const adminRef = db.doc("blockframesAdmin/uid-sAdmin");
    await assertFails(adminRef.get());
  });

  test("In maintenance, even super admin shouldn't be able to read a org", async () => {
    const orgRef = db.doc("orgs/O001");
    await assertFails(orgRef.get());
  });

  test("In maintenance, even super admin shouldn't be able to read all users", async () => {
    const usersRef = db.collection("users");
    await assertFails(usersRef.get());
  });
});

describe('Blockframe Not In Maintenance', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-bfAdmin'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("Blockframe admin should be able to read admin user", async () => {
    const adminRef = db.doc("blockframesAdmin/uid-sAdmin");
    await assertSucceeds(adminRef.get());
  });

  test("Blockframe admin should be able be able to read a org", async () => {
    const orgRef = db.doc("orgs/O001");
    await assertSucceeds(orgRef.get());
  });

  test("Blockframe admin should be able to read all users", async () => {
    const usersRef = db.collection("users");
    await assertSucceeds(usersRef.get());
  });

});


describe('Org Admin', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-admin'});
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
  let db: Firestore;

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
describe('Notification Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

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
  let db: Firestore;

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
  let db: Firestore;

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
  let db: Firestore;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});


describe('Movies Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    const newMovieId = 'MI-007';
    const existMovieId = 'MI-077';
    const newMovieDetails = {id: `${newMovieId}`};
    const storeConfig = {
      status: <StoreStatus>"draft",
      storeType: <StoreType>"Library",
      appAccess: <MovieAppAccess>{"festival": true }
    }

    beforeAll(async () => {
      db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
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
      const movieRef = db.doc(`movies/${newMovieId}`);
      const createdMovie:Partial<Movie> = {
        id: newMovieId, 
        storeConfig
      };      
      createdMovie.storeConfig['status'] = 'accepted';
      await assertFails(movieRef.set(createdMovie));
    });

    test("user valid org, without create permission for org should not be able to create movie", async () => {
      const newMovieTitleUnavailableId = 'MI-000';
      const movieRef = db.doc(`movies/${newMovieTitleUnavailableId}`);
      const createdMovie:Partial<Movie> = {
        id: newMovieTitleUnavailableId, 
        storeConfig
      };
      await assertFails(movieRef.set(createdMovie));
    });

    test("user valid org, with create permission for org, invalid id should not be able to create movie", async () => {
      const newMovieTitleUnavailableId = 'MI-000';      
      const movieRef = db.doc(`movies/${newMovieId}`);
      const createdMovie:Partial<Movie> = {
        id: newMovieTitleUnavailableId, 
        storeConfig
      };      
      await assertFails(movieRef.set(createdMovie));
    });

    test.skip("user valid org, with create permission for org should be able to create movie", async () => {
      const newTitle =  {id: `${newMovieId}`};
      const createdMovie:Partial<Movie> = {
        id: newMovieId, 
        //storeConfig
      };
      const movieDoc = db.collection('movies').doc(newMovieId).set(createdMovie);
      await assertSucceeds(movieDoc)
    });

    const fields:any = [
      ["id", 'MI-0xx'],
      ["_meta", { createdBy: ''}],
      ["_meta", { createdAt: ''}],
      ["_type", 'drama'],
      ["storeConfig", { appAccess: {catalog: true}}],
      ["storeConfig", { status: 'accepted'}], //<-- doesn't work??!!
      ["storeConfig", { storeType: 'blah'}],
      ["storeConfig", { appAccess: {festival: {}}}],
    ]
    test.each(fields)("user valid org, updating restricted '%s' field shouldn't be able to update movie", 
        async (key, value) => {
      const movieRef = db.doc(`movies/${existMovieId}`);
      const details = {};
      details[key] = value;
      await assertFails(movieRef.update(details));
    });

    test("user valid org, updating unrestricted field should be able to update movie", async () => {
      const movieRef = db.doc(`movies/${existMovieId}`);
      const movieDetailsOther = {notes: 'update in unit-test'}
      await assertSucceeds(movieRef.update(movieDetailsOther));
    });
  });

  describe('User with admin role', () => {
    const draftMovieId = 'MI-0d7';

    beforeAll(async () => {
      db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-admin'});
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("User with admin role in org should be able to delete movie", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertSucceeds(movieRef.delete());
    });
  });

  describe('With User not in org', () => {
    const newMovieId = 'MI-007'
    const draftMovieId = 'MI-0d7'
    const newMovieDetails = {id: `${newMovieId}`};

    beforeAll(async () => {
      db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-peeptom'});
    });

    afterAll(() => Promise.all(apps().map(app => app.delete())));

    test("user without valid org shouldn't be able to read movie title", async () => {
      const movieRef = db.doc("movies/M001");
      await assertFails(movieRef.get());
    });

    test("user without valid org shouldn't be able to create movie title", async () => {
      const movieRef = db.doc(`movies/${newMovieId}`);
      await assertFails(movieRef.set(newMovieDetails));
    });

    test("user without valid org shouldn't be able to delete movie title", async () => {
      const movieRef = db.doc(`movies/${draftMovieId}`);
      await assertFails(movieRef.delete());
    });

  });

});

//TODO: 4200
describe.skip('Contracts Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
  });

  afterAll(() => Promise.all(apps().map(app => app.delete())));

  test("test", async () => {

  });
});

describe('Events Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {

    beforeAll(async () => {
      db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-user2'});
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
      db  = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {uid: 'uid-peeptom'});
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
