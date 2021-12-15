//import { CallableContextOptions } from "firebase-functions-test";
//import { CallableContext } from "firebase-functions/lib/providers/https";
import { join, resolve } from 'path';
import { Firestore, initFirestoreApp  } from '@blockframes/testing/firebase/functions';
import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { addMessage, firestoreUppercase, simpleCallable, simpleHttp, userSaver }  from './main';
import firebaseTest = require('firebase-functions-test');
import * as admin from 'firebase-admin';
import { firebase } from '@env';

//We are testing against actual project with shrunk DB
const projectRealId = firebase().projectId;
const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
const testEnv = firebaseTest(firebase(), pathToServiceAccountKey);

describe('Test unit-tests', () => {
  let db: Firestore;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    // We are initing firestore with client settings to
    // test the functions effectively
    db = await initFirestoreApp(projectRealId, '', {}, { uid: 'uid-c8', firebase: { sign_in_provider: 'password' } });
  });

  afterEach(async () => {
    // After each test, db is reseted
    //await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('test message', async () => {
    const msgDocRef = db.doc('messages/QMi5awH4mwCpjkWt42rE');
    await assertSucceeds(msgDocRef.get());
  });


  //Test HTTP request/resp cloud function
  //http://localhost:5001/blockframes-mano/europe-west1/simpleHttp?text=Hello+World
  it("tests a simple HTTP request/response function", async () => {
    // A fake request object, with req.query.text set to 'input'
    const req = { query: { text: "input" } };

    const sendPromise = new Promise((resolve) => {
      // A fake response object, with a stubbed send() function which asserts that it is called
      // with the right result
      const res = {
        send: (text) => {
          resolve(text);
        }
      };

      // Invoke function with our fake request and response objects.
      simpleHttp(req as any, res as any);
    });

    // Wait for the promise to be resolved and then check the sent text
    const text = await sendPromise;
    expect(text).toEqual(`text: input`);
  });

  //Implement unit-tests like:
  //https://raw.githubusercontent.com/firebase/quickstart-testing/master/unit-test-cloud-functions/functions/test/functions.spec.js

  it('tests the simpleCallable http cloud function', async () => {
    const wrapped = testEnv.wrap(simpleCallable);

    //Compose the call to simpleCallable cf with param data
    const data = {
      a: 1,
      b: 2,
    };

    // Call the wrapped function with data and context
    const result = await wrapped(data);
    // Check that the result looks like we expected.
    expect(result).toEqual({
      c: 3,
    });
  });

  it("tests a Cloud Firestore function", async () => {
    const wrapped = testEnv.wrap(firestoreUppercase);

    // Make a fake document snapshot to pass to the function
    const after = testEnv.firestore.makeDocumentSnapshot(
      {
        text: "hello world",
      },
      "/lowercase/foo"
    );

    // Call the function
    await wrapped(after);

    // Check the data in the Firestore emulator
    const snap = await admin.firestore().doc("/uppercase/foo").get();
    expect(snap.data()).toEqual({
      text: "HELLO WORLD",
    });
  });

  it("tests an Auth function that interacts with Firestore", async () => {
    const wrapped = testEnv.wrap(userSaver);

    // Make a fake user to pass to the function
    //const uid = `${new Date().getTime()}`;
    const uid = 'abcd123';
    const email = `user-${uid}@example.com`;
    const user = testEnv.auth.makeUserRecord({
      uid,
      email,
    });

    // Call the function
    await wrapped(user);

    //TODO: Check it
    // Check the data was written to the Firestore emulator
    const snap = await admin.firestore().collection("users").doc(uid).get();
    console.log(snap);

    const data = snap.data();
    console.log(data);

    expect(data.uid).toEqual(uid);
    expect(data.email).toEqual(email);
  });
})

