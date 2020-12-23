import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

describe('Events Rules Tests', () => {
  const projectId = `evrules-spec-${Date.now()}`;
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
