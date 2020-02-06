import { setup, teardown } from './helpers.spec';
import { mockData, userMarie, userMax, userTom } from './mock';

describe('permission table', () => {
  afterAll(async () => {
    await teardown();
  });

  test('deny a user not logged to access the permission doc of another org', async () => {
    const db = await setup(undefined, mockData);
    const orgRef = db.doc(`permissions/${userMax.orgId}`);
    await expect(orgRef.get()).toDeny();
    await expect(orgRef.update({ updated: true })).toDeny();
    await expect(orgRef.set({ set: true })).toDeny();
    await expect(orgRef.delete()).toDeny();
  });

  test('deny a user from another org to access the permission doc', async () => {
    const db = await setup(userTom, mockData);
    const orgRef = db.doc(`permissions/${userMax.orgId}`);

    await expect(orgRef.get()).toDeny();
    await expect(orgRef.update({ updated: true })).toDeny();
    await expect(orgRef.set({ set: true })).toDeny();
    await expect(orgRef.delete()).toDeny();
  });

  test('allow a user to access their org docs', async () => {
    const db = await setup(userMax, mockData);
    const orgRef = db.doc(`permissions/${userMax.orgId}`);

    await expect(orgRef.get()).toAllow();
    await expect(orgRef.update({ updated: true })).toDeny();
    await expect(orgRef.set({ id: userMax.orgId, set: true })).toDeny();
    await expect(orgRef.delete()).toDeny();
  });

  test('allow a superadmin to access their org docs', async () => {
    const db = await setup(userMarie, mockData);
    const orgRef = db.doc(`permissions/${userMarie.orgId}`);

    await expect(orgRef.get()).toAllow();
    await expect(orgRef.update({ updated: true })).toAllow();
    await expect(orgRef.set({ id: userMarie.orgId, set: true })).toAllow();

    // changing id is forbidden!
    await expect(orgRef.update({ id: '000' })).toDeny();
    await expect(orgRef.set({ set: true })).toDeny();

    // removing your perms is forbidden
    await expect(orgRef.delete()).toDeny();
  });

  test('allow a superadmin to create a permission document', async () => {
    const db = await setup(userMarie, mockData);
    const permDoc = db.doc(`permissions/${userMarie.orgId}/documentPermissions/newId`);

    await expect(permDoc.set({ id: 'wrongId', set: true })).toDeny();
    await expect(permDoc.set({ id: 'newId', set: true })).toAllow();
    await expect(permDoc.get()).toAllow();
    await expect(permDoc.update({ updated: true })).toAllow();
    await expect(permDoc.delete()).toDeny();
  });

  test('disallow a user not admin to UPDATE a permission document', async () => {
    // they can create!

    const db = await setup(userMax, mockData);
    const permDoc = db.doc(`permissions/${userMax.orgId}/documentPermissions/newId`);

    await expect(permDoc.set({ id: 'newId', set: true })).toAllow();
    await expect(permDoc.get()).toAllow();
    await expect(permDoc.update({ updated: true })).toDeny();
    await expect(permDoc.delete()).toDeny();
  });
});
