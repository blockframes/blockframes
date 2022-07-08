﻿import { getFirestoreEmulator } from '@blockframes/firebase-utils';
import { initFunctionsTestMock } from './functions';

describe('firebase testing library', () => {
  it.skip('should read the doc and get same data', async () => {
    //Init Mocks and environment
    initFunctionsTestMock();

    const db = getFirestoreEmulator();
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    const doc = await docRef.get();
    expect(doc.data()).toEqual(testData);
  });
});
