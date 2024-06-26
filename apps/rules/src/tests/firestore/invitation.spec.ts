﻿import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteApp, getApps } from 'firebase/app';
import { Firestore, initFirestoreApp, rulesFixtures as testFixture } from '@blockframes/testing/unit-tests';
import { Invitation, InvitationStatus } from '@blockframes/model';

describe('Invitation Rules Tests', () => {
  const projectId = `inrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-sAdmin', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should not allow user to delete', async () => {
      const inviteRef = db.doc('invitations/I011');
      await assertFails(inviteRef.delete());
    });

    test('should allow user to delete', async () => {
      const inviteRef = db.doc('invitations/I012');
      await assertSucceeds(inviteRef.delete());
    });
  });

  describe('With User in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should not allow user to create ', async () => {
      const inviteRef = db.doc('invitations/001');
      await assertFails(inviteRef.set({ note: 'A notification' }));
    });

    test('should allow user to read "attendEvent" type', async () => {
      const inviteRef = db.doc('invitations/I001');
      await assertSucceeds(inviteRef.get());
    });

    test('should not allow user to read "cancelEvent" type', async () => {
      const inviteRef = db.doc('invitations/I010');
      await assertFails(inviteRef.get());
    });

    test('should allow user to delete if same fromUser.uid', async () => {
      const inviteRef = db.doc('invitations/I011');
      await assertSucceeds(inviteRef.delete());
    });

    describe('Create Invitation', () => {
      test('should allow user to create invitation status: pending, mode: request', async () => {
        const newInviteId = 'I002';
        const createInvite: Partial<Invitation> = {
          mode: 'request',
          status: <InvitationStatus>'pending',
          fromUser: { uid: 'uid-user2', email: 'user2@O001.com', hideEmail: false },
        };
        const inviteDoc = db.collection('invitations').doc(newInviteId).set(createInvite);
        await assertSucceeds(inviteDoc);
      });
    });

    describe('Update Invitation', () => {
      const existInviteId = 'I001';
      const fields: [string, unknown][] = [
        ['id', 'MI-0xx'],
        ['mode', { createdBy: '' }],
        ['fromOrg', { id: 'O007' }],
        ['fromUser', { uid: 'uid-user3' }],
        ['toOrg', { id: 'O008' }],
        ['toUser', { uid: 'uid-sAdmin' }],
        ['eventId', 'I002'],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const inviteRef = db.doc(`invitations/${existInviteId}`);
        const details = {};
        details[key] = value;
        await assertFails(inviteRef.update(details));
      });
    });
  });

  describe('With unintended user, respond to invitation', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-sAdmin', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    const statuses = ['accepted', 'declined'];
    test.each(statuses)("should not allow user to set invitation as '%s'", async (status) => {
      const inviteRef = db.doc('invitations/I001');
      await assertFails(inviteRef.update({ status }));
    });
  });

  describe('With invited user, respond to invitation', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-user2', { firebase: { sign_in_provider: 'password' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    const statuses = ['accepted', 'declined'];
    test.each(statuses)("should allow user to set invitation as '%s'", async (status) => {
      const inviteRef = db.doc('invitations/I001');
      await assertSucceeds(inviteRef.update({ status }));
    });
  });

  describe('With Anonymous user', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, 'uid-c8-anon', { firebase: { sign_in_provider: 'anonymous' } });
    });

    afterAll(() => Promise.all(getApps().map((app) => deleteApp(app))));

    test('should not be able to list all invitations', async () => {
      const allDocs = db.collection('invitations');
      await assertFails(allDocs.get());
    });

    test('should be able to fetch an invitation to an event by ID', async () => {
      const docRef = db.doc('invitations/I013');
      await assertSucceeds(docRef.get());
    });

    test('should not be able to fetch an invitation by ID that is not attendEvent', async () => {
      const docRef = db.doc('invitations/I012');
      await assertFails(docRef.get());
    });
  });
});
