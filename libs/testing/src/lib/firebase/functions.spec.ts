import { initFunctionsTestMock } from './functions';
import * as firebaseTesting from '@firebase/testing'
import { firestore, initializeApp } from 'firebase-admin';

describe('firebase testing library', () => {

  describe('Direct access to emulator', () => {
    it.skip('should access emulator directly', async () => {
      //TODO : This is for reference
      const db = firebaseTesting.initializeTestApp({
        projectId: String(Math.random())
      }).firestore();
      const testDoc = await db.collection("testCollection").doc("testDoc");
      firebaseTesting.assertSucceeds(testDoc.get());
    });
  
    it.skip('should set a field in document', async () => {
      const db = firebaseTesting.initializeTestApp({
        projectId: String(Math.random())
      }).firestore();
      const testStr = "blockframes";
      const testDoc = db.collection("testCollection")
                      .doc("testDoc").set({testStr});
      //TODO: Debug the test failure.                
      await expect(db.doc('testCollection/testDoc').get())
            .resolves.toBe({testStr});
    });
  })

  describe('Access emulator through library', () => {
    let db;

    beforeAll(() => {
      const firebaseTest = initFunctionsTestMock();
      db = firestore();      
    }) 

    it('should be able to access the emulator', async () => {
      const testDoc = await db.collection("testCollection").doc("testDoc");
      firebaseTesting.assertSucceeds(testDoc.get());    
    });

    it('should be able to read the document', async () => {
      const testStr = "blockframes";
      const testDoc = db.collection("testCollection")
                      .doc("testDoc").set({testStr});
      //TODO: Debug the test failure.      
      //Expectation failure : Received promise rejected instead of resolved          
      await expect(db.doc('testCollection/testDoc').get())
            .resolves.toBe({testStr});   
    });
  });

});
