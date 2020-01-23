import { setup, teardown } from './helpers';
import { mockData, userMarie, userMax } from './mock';

describe('Users rules', () => {
  afterAll(async () => {
    await teardown();
  });

  test('deny a user not logged to access another user data', async () => {
    const db = await setup(undefined, mockData);

    const userRef = db.doc(`users/${userMax.uid}`);
    await expect(userRef.get()).toDeny();
  });

  test('allow a user logged to access their user data', async () => {
    const db = await setup(userMax, mockData);

    const meRef = db.doc(`users/${userMax.uid}`);
    await expect(meRef.get()).toAllow();

    const anotherRef = db.doc(`users/${userMarie.uid}`);
    await expect(anotherRef.get()).toDeny();
  });
});
