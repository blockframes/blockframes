import { firestore } from 'firebase-admin';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it('should read the doc and get same data', async () => {
    console.log(process.env.JEST_WORKER_ID);
    const id = process.env.JEST_WORKER_ID;
    expect(id).not.toBe("1");
    //Init Mocks and environment
    initFunctionsTestMock();

    const db = firestore();
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    const doc = await docRef.get();
    expect(doc.data()).toEqual(testData);
  });
});
