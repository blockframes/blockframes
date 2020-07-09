import { firestore } from 'firebase-admin';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it('should be read the doc', async () => {
    //Init Mocks and environment
    initFunctionsTestMock();

    const db = firestore();
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    const doc = await db.doc('testCollection/testDoc').get();
    expect(doc.data()).toEqual(testData);
  });
});
