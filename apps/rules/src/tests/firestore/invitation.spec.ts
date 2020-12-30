import {
  apps,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/firebase/functions';

//TODO: 4195
describe('Invitation Rules Tests', () => {
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

    test('should allow user to update invitation', async () => {
      const inviteRef = db.doc('invitations/I001');
      await assertSucceeds(inviteRef.update({note: 'important'}));
    });

    describe('Update Invitation', () => {
      const existInviteId = 'I001';
      const fields: any = [
        ['id', 'MI-0xx'],
        /*['mode', { createdBy: '' }],
        ['fromOrg', 'drama'],
        ['fromUser', { appAccess: { catalog: true } }],
        ['toOrg', { status: 'rejected' }],
        ['toUser', { storeType: 'blah' }],
        ['docId', { appAccess: { festival: {} } }],*/
      ];
      test.each(fields)("updating restricted '%s' field shouldn't be able", async (key, value) => {
        const inviteRef = db.doc(`invitations/${existInviteId}`);
        const details = {};
        details[key] = value;
        await assertFails(inviteRef.update(details));
      });

      /*
      test('user valid org, updating unrestricted field should be able', async () => {
        const inviteRef = db.doc(`movies/${existMovieId}`);
        const movieDetailsOther = { notes: 'update in unit-test' };
        await assertSucceeds(inviteRef.update(movieDetailsOther));
      });*/
    });
  });
});

