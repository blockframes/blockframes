import { initFunctionsTestMock } from './functions';
import * as firebaseTesting from '@firebase/testing'
import { firestore, initializeApp } from 'firebase-admin';

const project_ID = "blockframes-mano";

describe('firebase testing library', () => {
  test.todo('Hello World!');

  it('should access emulator directly', async () => {
    const db = firebaseTesting.initializeTestApp({
      projectId: project_ID
    }).firestore();
    const testDoc = await db.collection("testCollection").doc("testDoc");
    firebaseTesting.assertSucceeds(testDoc.get());
  });

  it('should set a field in document', async () => {
    const db = firebaseTesting.initializeTestApp({
      projectId: project_ID
    }).firestore();
    const testStr = "blockframes";
    const testDoc = db.collection("testCollection")
                    .doc("testDoc").set({testStr});
    await expect(db.doc('testCollection/testDoc').get())
          .resolves.toBe({testStr});
  });

  it.skip('should be able to access the emulator', async () => {
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
