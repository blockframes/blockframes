//import { CallableContextOptions } from "firebase-functions-test";
//import { CallableContext } from "firebase-functions/lib/providers/https";
import { join, resolve } from 'path';
import { Firestore, initFirestoreApp  } from '@blockframes/testing/firebase/functions';
import { apps, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { addMessage, simpleCallable }  from './main';
import firebaseTest = require('firebase-functions-test');
import { firebase } from '@env';
const projectRealId = firebase().projectId;
const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
const testEnv = firebaseTest(firebase(), pathToServiceAccountKey);

describe('Test unit-tests', () => {
  //const projectId = `test-spec-${Date.now()}`;
  let db: Firestore;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    //const projectId = firebase().projectId;
    db = await initFirestoreApp(projectRealId, '', {}, { uid: 'uid-c8', firebase: { sign_in_provider: 'password' } });
    //const app = initializeAdminApp({ projectId });
    //db = app.firestore();
  });

  afterEach(async () => {
    // After each test, db is reseted
    //await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('test message', async () => {
    const msgDocRef = db.doc('messages/QMi5awH4mwCpjkWt42rE');
    await assertSucceeds(msgDocRef.get());
  });

  //Implement unit-tests like:
  //https://raw.githubusercontent.com/firebase/quickstart-testing/master/unit-test-cloud-functions/functions/test/functions.spec.js

  it.only('tests the simpleCallable http cloud function', async () => {
    const wrapped = testEnv.wrap(simpleCallable);

    //Compose the call to simpleCallable cf with param data
    const data = {
      a: 1,
      b: 2,
    };

    // Call the wrapped function with data and context
    const result = await wrapped(data);
    console.log(result);
    // Check that the result looks like we expected.
    expect(result).toEqual({
      c: 3,
    });
  });

})

