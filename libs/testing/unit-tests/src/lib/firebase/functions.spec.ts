import { firestore } from 'firebase-admin';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it('should read the doc and get same data', async () => {
    //Init Mocks and environment
    await initFunctionsTestMock();
    const db = firestore(); // * The reason we do it this way is because functions use this connect code so we test it this way
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    const doc = await docRef.get();
    expect(doc.data()).toEqual(testData);
  });
});
