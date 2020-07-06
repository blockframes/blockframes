import { initFunctionsTestMock } from './functions';
import { firestore, initializeApp } from 'firebase-admin';

describe('firebase testing library', () => {
  test.todo('Hello World!');
  it('should be able to access the emulator', async () => {
    const firebaseTest = initFunctionsTestMock();
    const db = firestore();
    const test = 5;
    await db
      .collection('test')
      .doc('test')
      .set({ test });
    await expect(db.doc('test/test').get()).resolves.toBe(5);
  });
});
