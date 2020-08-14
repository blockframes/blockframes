import { firestore } from 'firebase-admin';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it('should read the doc and get same data', async () => {
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
