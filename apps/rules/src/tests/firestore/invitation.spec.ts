﻿import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';
import { Invitation, InvitationStatus } from '@blockframes/invitation/+state';

describe.skip('Invitation Rules Tests', () => {
  const projectId = `inrules-spec-${Date.now()}`;
  let db: Firestore;

  describe('With User not in org', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-sAdmin' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

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
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2' });
    });

    afterAll(() => Promise.all(apps().map((app) => app.delete())));

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
        const newInviteId = 'I002'
        const createInvite: Partial<Invitation> = {
          mode: 'request',
          status: <InvitationStatus>'pending',
          fromUser: {uid: 'uid-user2', email: 'user2@O001.com'}
        };
        const inviteDoc = db.collection('invitations').doc(newInviteId).set(createInvite);
        await assertSucceeds(inviteDoc);
      });
    });

    describe('Update Invitation', () => {
      const existInviteId = 'I001';
      const fields: any = [
        ['id', 'MI-0xx'],
        ['mode', { createdBy: '' }],
        ['fromOrg', {id: 'O007'}],
        ['fromUser', { uid: 'uid-user3' }],
        ['toOrg', { id: 'O008' }],
        ['toUser', { uid: 'uid-sAdmin' }],
        ['docId', 'I002'],
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const inviteRef = db.doc(`invitations/${existInviteId}`);
        const details = {};
        details[key] = value;
        await assertFails(inviteRef.update(details));
      });

      test('should allow user to update invitation', async () => {
        const inviteRef = db.doc('invitations/I001');
        await assertSucceeds(inviteRef.update({note: 'important'}));
      });
    });
  });
});

