import { setup, teardown } from './helpers';
import { mockData, userGilles, userMarie, userMax, userVincentBlockframesAdmin } from './mock';

describe('blockframes admins rules', () => {
  afterAll(async () => {
    await teardown();
  });

  test('when a user is in the admin collection, they can access everything', async () => {
    const db = await setup(userVincentBlockframesAdmin, mockData);

    // Access other users
    const otherUserRef = db.doc(`users/${userMax.uid}`);
    await expect(otherUserRef.get()).toAllow();
    await expect(otherUserRef.update({ test: true })).toAllow();
    await expect(otherUserRef.set({ overwritten: true })).toAllow();
    await expect(otherUserRef.delete()).toAllow();

    // Access other orgs
    const orgRef = db.doc(`orgs/${userGilles.orgId}`);
    await expect(orgRef.get()).toAllow();
    await expect(orgRef.update({ test: true })).toAllow();
    await expect(orgRef.set({ overwritten: true })).toAllow();
    await expect(orgRef.delete()).toAllow();
  });

  test('when user is not in admin collection, they can not access other users admin status', async () => {
    const db = await setup(userMax, mockData);

    const adminsCollection = db.collection('blockframesAdmin');
    const maxAdminDoc = adminsCollection.doc(userMax.uid);
    const vincentAdminDoc = adminsCollection.doc(userVincentBlockframesAdmin.uid);
    const marieAdminDoc = adminsCollection.doc(userMarie.uid);

    // I can access my doc to check its existence, but not edit it.
    await expect(maxAdminDoc.get()).toAllow();
    await expect(maxAdminDoc.update({ updated: true })).toDeny();
    await expect(maxAdminDoc.set({ set: true })).toDeny();
    await expect(maxAdminDoc.delete()).toDeny();

    // Listing and creating in admin collection is forbidden
    await expect(adminsCollection.get()).toDeny();
    await expect(adminsCollection.add({ exists: true })).toDeny();

    // Toying with an admin doc is forbidden
    await expect(vincentAdminDoc.get()).toDeny();
    await expect(vincentAdminDoc.update({ updated: true })).toDeny();
    await expect(vincentAdminDoc.set({ set: true })).toDeny();
    await expect(vincentAdminDoc.delete()).toDeny();

    // Toying with a non-admin doc is forbidden
    await expect(marieAdminDoc.get()).toDeny();
    await expect(marieAdminDoc.update({ updated: true })).toDeny();
    await expect(marieAdminDoc.set({ set: true })).toDeny();
    await expect(marieAdminDoc.delete()).toDeny();
  });
});
