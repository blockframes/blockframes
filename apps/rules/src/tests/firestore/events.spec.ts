import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { EventDocument, Meeting, MeetingAttendee } from '@blockframes/event/+state/event.firestore';

describe('Events Rules Tests', () => {
  const projectId = `evrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('user with valid org should be able to read event', async () => {
      const eventRef = db.doc('events/E001');
      await assertSucceeds(eventRef.get());
    });

    test('user with valid org should be able to list all events', async () => {
      const allEvents = db.collection('events');
      await assertSucceeds(allEvents.get());
    });

    test("user with valid org, invalid event id shouldn't be able to create event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E077' };
      await assertFails(eventRef.set(eventDetails));
    });

    test("user with valid org, invalid ownerOrgId shouldn't be able to create event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerOrgId: 'O002' };
      await assertFails(eventRef.set(eventDetails));
    });

    test('user with valid org, ownerOrgId as uid should be able to create event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerOrgId: 'O001' };
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test('user with valid org, ownerOrgId as orgId should be able to create event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E007', ownerOrgId: 'O001' };
      await assertSucceeds(eventRef.set(eventDetails));
    });

    test("user with valid org, ownerOrgId as orgId, modifying id shouldn't be able to update event", async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { id: 'E008' };
      await assertFails(eventRef.update(eventDetails));
    });

    test('user with valid org, ownerOrgId as orgId should be able to update event', async () => {
      const eventRef = db.doc('events/E007');
      const eventDetails = { notes: 'Unit Test' };
      await assertSucceeds(eventRef.update(eventDetails));
    });

    test('user with valid org, ownerOrgId as orgId should be able to allow user access to meeting event', async () => {
      const docRef = db.doc('events/E003');
      const doc = await docRef.get()
      const event = doc.data() as EventDocument<Meeting>;

      // Load our test set
      const credentials = {
        uid: 'uid-foo',
        firstName: 'anonymous',
        lastName: 'user',
        status: 'accepted',
      } as MeetingAttendee;

      event.meta.attendees[credentials.uid] = credentials;
      await assertSucceeds(docRef.update(event));
    });

    test('user with valid org, ownerOrgId as orgId should be able to delete event', async () => {
      const eventRef = db.doc('events/E007');
      await assertSucceeds(eventRef.delete());
    });

    test('user with valid org but not ownerOrgId as orgId should be able to update attendees status', async () => {
      const eventRef = db.doc('events/E002');
      const eventDetails = { meta: { attendees: { 'uid-user2': 'requesting' } } };
      await assertSucceeds(eventRef.update(eventDetails));
    });

    test('user with valid org but not ownerOrgId as orgId should not be able to accept himself', async () => {
      const eventRef = db.doc('events/E002');
      const eventDetails = { meta: { attendees: { 'uid-user2': 'accepted' } } };
      await assertFails(eventRef.update(eventDetails));
    });

    test('user with valid org but not ownerOrgId as orgId should not be able to set himself as owner', async () => {
      const eventRef = db.doc('events/E002');
      const eventDetails = { meta: { attendees: { 'uid-user2': 'owner' } } };
      await assertFails(eventRef.update(eventDetails));
    });

    test('user with valid org but not ownerOrgId as orgId should not be able to update event accessibility', async () => {
      const eventRef = db.doc('events/E002');
      const eventDetails = { accessibility: 'public' };
      await assertFails(eventRef.update(eventDetails));
    });
  });

  describe('With Anonymous user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8-anon', firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test('should not be able to list all events', async () => {
      const allDocs = db.collection('events');
      await assertFails(allDocs.get());
    });

    test('should be able to fetch an event by ID', async () => {
      const docRef = db.doc('events/E001');
      await assertSucceeds(docRef.get());
    });

    it('user can request to enter meeting room', async () => {
      const docRef = db.doc('events/E003');
      const doc = await docRef.get()
      const event = doc.data() as EventDocument<Meeting>;

      // Load our test set
      const credentials = {
        uid: 'uid-c8-anon',
        firstName: 'anonymous',
        lastName: 'user',
        status: 'requesting',
      } as MeetingAttendee;

      event.meta.attendees[credentials.uid] = credentials;
      await assertSucceeds(docRef.update(event));
    });

    it('user can leave meeting room', async () => {
      const docRef = db.doc('events/E003');
      const doc = await docRef.get()
      const event = doc.data() as EventDocument<Meeting>;

      // Load our test set
      const credentials = {
        uid: 'uid-c8-anon',
        firstName: 'anonymous',
        lastName: 'user',
        status: 'ended',
      } as MeetingAttendee;

      event.meta.attendees[credentials.uid] = credentials;
      await assertSucceeds(docRef.update(event));
    });

    it('user cannot allow himself into meeting room', async () => {
      const docRef = db.doc('events/E003');
      const doc = await docRef.get()
      const event = doc.data() as EventDocument<Meeting>;

      // Load our test set
      const credentials = {
        uid: 'uid-c8-anon',
        firstName: 'anonymous',
        lastName: 'user',
        status: 'accepted',
      } as MeetingAttendee;

      event.meta.attendees[credentials.uid] = credentials;
      await assertFails(docRef.update(event));
    });

  });

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-peeptom', firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

    test("user without valid org shouldn't be able to list all event", async () => {
      const allEvents = db.collection('events');
      await assertFails(allEvents.get());
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
