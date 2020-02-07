import { setup, teardown } from './helpers.spec';
import { mockData, userMarie, userMax, userTom } from './mock';

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

    // I can access profile of other users in my org.
    const coworkerRef = db.doc(`users/${userMarie.uid}`);
    await expect(coworkerRef.get()).toAllow();

    const anotherRef = db.doc(`users/${userTom.uid}`);
    await expect(anotherRef.get()).toDeny();
  });
});
