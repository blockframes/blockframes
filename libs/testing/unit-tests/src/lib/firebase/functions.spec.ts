import { connectFirestoreEmulator } from '@blockframes/firebase-utils/emulator';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it.skip('should read the doc and get same data', async () => {
    //Init Mocks and environment
    initFunctionsTestMock();

    const db = connectFirestoreEmulator();
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    const doc = await docRef.get();
    expect(doc.data()).toEqual(testData);
  });
});
