import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { META_COLLECTION_NAME, MAINTENANCE_DOCUMENT_NAME } from '@blockframes/utils/maintenance';

//Meta collection, for maintenance control.
const metaDoc = `${META_COLLECTION_NAME}/${MAINTENANCE_DOCUMENT_NAME}`;
testFixture[metaDoc] = {};
testFixture[metaDoc].endedAt = true;

describe('Blockframe In Maintenance', () => {
  const projectId = `rules-spec-${Date.now()}`;
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

describe('Notification Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  const existingNotif = 'notifications/001';
  let db: Firestore;

  describe('With User not in TO field', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should not allow user to read notification if not marked to', async () => {
      const notifRef = db.doc(existingNotif);
      await assertFails(notifRef.get());
    });

    test('should not allow user to create notification', async () => {
      const notifRef = db.doc(existingNotif);
      await assertFails(notifRef.set({ note: 'A notification' }));
    });

    const fields: any = [
      ['id', '001'],
      ['toUserId', 'uid-002'],
      ['isRead', true],
    ];
    test.each(fields)(
      "updating restricted '%s' field shouldn't be able to update notification",
      async (key, value) => {
        const notifRef = db.doc(existingNotif);
        const details = {};
        details[key] = value;
        await assertFails(notifRef.update(details));
      }
    );
  });

  describe('With User in TO field', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should allow user to read notification', async () => {
      const notifRef = db.doc('notifications/001');
      await assertSucceeds(notifRef.get());
    });

    test('should not allow user to create notification', async () => {
      const notifRef = db.doc('notifications/002');
      await assertFails(notifRef.set({ note: 'A notification', toUserId: 'uid-c8' }));
    });

    const fields: any = [
      ['id', '002'],
      ['date', new Date()],
      ['toUserId', 'uid-002'],
      ['type', 'movie'],
      ['docId', 'x-002'],
      ['user', '002'],
      ['organization', 'O-001'],
      ['movies', 'M-001'],
    ];
    test.each(fields)(
      "updating restricted '%s' field shouldn't be able to update notification",
      async (key, value) => {
        const notifRef = db.doc(existingNotif);
        const details = {};
        details[key] = value;
        await assertFails(notifRef.update(details));
      }
    );

    test("User should be able to update 'isRead' field in notification", async () => {
      const notifRef = db.doc(existingNotif);
      const details = { isRead: true };
      await assertSucceeds(notifRef.update(details));
    });

    test('should not allow user to delete notification', async () => {
      const notifRef = db.doc('notifications/001');
      await assertFails(notifRef.delete());
    });
  });
});

//TODO: 4195
describe.skip('Invitation Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('should not allow user to create ', async () => {
    const notifRef = db.doc('invitations/001');
    await assertFails(notifRef.set({ note: 'A notification' }));
  });
});

//TODO: 4197
describe.skip('Organization Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));
});

//TODO: 4198
describe.skip('Permission Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));
});

//TODO: 4200
describe.skip('Contracts Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
  });

  afterAll(() => Promise.all(apps().map((app) => app.delete())));

  test('test', async () => {});
});

describe('Events Rules Tests', () => {
  const projectId = `rules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user with valid org should be able to read event', async () => {
      const eventRef = db.doc('events/E001');
      await assertSucceeds(eventRef.get());
    });

    test("user with valid org, invalid event id shouldn't be able to create event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E077' };
      await assertFails(eventRef.set(eventDetails));
    });

    test("user with valid org, invalid ownerId shouldn't be able to create event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerId: 'uid-007' };
      await assertFails(eventRef.set(eventDetails));
    });

    test('user with valid org, ownerId as uid should be able to create event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerId: 'uid-user2' };
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test('user with valid org, ownerId as orgId should be able to create event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerId: 'O001' };
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test("user with valid org, ownerId as orgId, modifying id shouldn't be able to update event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E008' };
      await assertFails(eventRef.update(eventDetails));
    });

    test('user with valid org, ownerId as orgId should be able to update event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { notes: 'Unit Test' };
      await assertSucceeds(eventRef.update(eventDetails));
    });

    test('user with valid org, ownerId as orgId should be able to delete event', async () => {
      const eventRef = db.doc('events/E007');
      await assertSucceeds(eventRef.delete());
    });
  });

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, {
        uid: 'uid-peeptom',
      });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without valid org shouldn't be able to read event", async () => {
      const eventRef = db.doc('events/E001');
      await assertFails(eventRef.get());
    });

    test("user without valid org shouldn't be able to create event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007' };
      await assertFails(eventRef.set(eventDetails));
    });

    test("user without valid org shouldn't be able to update event", async () => {
      const eventRef = db.doc('events/E001');
      const eventDetails = { notes: 'Unit Test' };
      await assertFails(eventRef.update(eventDetails));
    });

    test("user without valid org shouldn't be able to delete event", async () => {
      const eventRef = db.doc('events/E001');
      await assertFails(eventRef.delete());
    });
  });
});
