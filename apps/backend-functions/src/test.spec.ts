import { CallableContextOptions } from "firebase-functions-test/lib/main";
import { CallableContext } from "firebase-functions/lib/providers/https";
//import { getTestingProjectId, initFunctionsTestMock, populate } from "@blockframes/testing/firebase/functions";
import { Firestore, initFirestoreApp  } from '@blockframes/testing/firebase/functions';
import { apps, assertFails, assertSucceeds, initializeAdminApp } from '@firebase/rules-unit-testing';

import { firebase } from '@env';


describe('Test unit-tests', () => {
  let db: Firestore;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    //initFunctionsTestMock();
    const projectId = firebase().projectId;
    //db = await initFirestoreApp(projectId, 'firestore.rules', testFixture, { uid: 'uid-bfAdmin', firebase: { sign_in_provider: 'password' } });
    const app = initializeAdminApp({ projectId });
    db = app.firestore();
  });

  afterEach(async () => {
    // After each test, db is reseted
    //await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('test message', async () => {
    const msgDocRef = db.doc('messages/QMi5awH4mwCpjkWt42rE');
    await assertSucceeds(msgDocRef.get());
  });

})

