import { setup, teardown } from './helpers';
import { mockData, userMax } from './mock';

describe('Deals & Contracts rules', () => {
  afterAll(async () => {
    await teardown();
  });

  test('deny a user not logged to access a contract', async () => {
    const db = await setup(undefined, mockData);

    const orgRef = db.doc(`contracts/${userMax.orgId}`);
    await expect(orgRef.get()).toDeny();
  });
});
