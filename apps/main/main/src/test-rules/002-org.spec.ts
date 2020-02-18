import { setup, teardown } from './helpers.spec';
import { mockData, userGilles, userMax } from './mock';

describe('Org rules', () => {
  afterAll(async () => {
    await teardown();
  });

  test('deny a user not logged to access an org data', async () => {
    const db = await setup(undefined, mockData);

    const orgRef = db.doc(`orgs/${userMax.orgId}`);
    await expect(orgRef.get()).toDeny();
  });

  test('allow a user logged to access only their org data', async () => {
    const db = await setup(userMax, mockData);

    const orgRef = db.doc(`orgs/${userMax.orgId}`);
    await expect(orgRef.get()).toAllow();
    await expect(orgRef.update({ updated: 12 })).toAllow();

    const anotherOrgRef = db.doc(`orgs/${userGilles.orgId}`);
    // await expect(anotherOrgRef.get()).toDeny(); // R001
    // await expect(anotherOrgRef.update({ name: 'Renamed!' })).toDeny(); // R002
  });
});
