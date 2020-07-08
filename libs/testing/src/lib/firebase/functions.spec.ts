import * as firebaseTesting from '@firebase/testing'
import { firestore, initializeApp } from 'firebase-admin';

describe('firebase testing library', () => {
  it.skip('should be able to access the emulator', async () => {
    //Init test DB
    const projectId = String(Math.random());
    process.env.GCLOUD_PROJECT = projectId;
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    initializeApp({ projectId });      

    const db = firestore();
    const docRef = db.collection('testCollection').doc('testDoc');
    const testData = { name: 'blockframes' };
    await docRef.set(testData);
    await firebaseTesting.assertSucceeds(docRef.get());  });
});
