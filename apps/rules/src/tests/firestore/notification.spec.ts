import { apps, assertFails, assertSucceeds } from '@firebase/testing';
import { testFixture } from './fixtures/data';
import { Firestore, initFirestoreApp } from '@blockframes/testing/unit-tests';

describe('Notification Rules Tests', () => {
  const projectId = `notrules-spec-${Date.now()}`;
  const existingNotif = 'notifications/001';
  let db: Firestore;

  describe('With User not in TO field', () => {
    beforeAll(async () => {
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-user2', firebase: { sign_in_provider: 'password' } });
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

    const fields: [string, unknown][] = [
      ['id', '001'],
      ['toUserId', 'uid-002'],
      ['app.isRead', true],
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
      db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-c8', firebase: { sign_in_provider: 'password' } });
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

    const fields: [string, unknown][] = [
      ['id', '002'],
      ['_meta.createdAt', new Date()],
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

    test("User should be able to update 'app.isRead' field in notification", async () => {
      const notifRef = db.doc(existingNotif);
      const details = { app: { isRead: true } };
      await assertSucceeds(notifRef.update(details));
    });

    test('should not allow user to delete notification', async () => {
      const notifRef = db.doc('notifications/001');
      await assertFails(notifRef.delete());
    });
  });
});
