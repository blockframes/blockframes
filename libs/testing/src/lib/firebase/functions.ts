import * as admin from 'firebase-admin';
import firebaseFunctionsTest from 'firebase-functions-test';
import { runChunks } from '@blockframes/firebase-utils';
import { resolve } from 'path';
import { config } from 'dotenv';
import { firebase as firebaseEnv } from '@env';
import { initializeTestApp, loadFirestoreRules, initializeAdminApp } from '@firebase/rules-unit-testing';
import type { FeaturesList } from 'firebase-functions-test/lib/features';
import type { AppOptions } from 'firebase-admin'; // * Correct Import
import fs from 'fs';
import { TokenOptions } from '@firebase/rules-unit-testing/dist/src/api';

export interface FirebaseTestConfig extends FeaturesList {
  firebaseConfig?: { projectId: string }
}

let testIndex = 0;
config();

/**
 * Helper function that sets up `firebase-functions-test` using environment
 * config.
 * @param offline if set to true, tests will be offline-only
 * @param overrideConfig allows custom configuration of test object
 * @returns firebase-functions-test mock object
 */
export function initFunctionsTestMock(offline = true, overrideConfig?: AppOptions): FirebaseTestConfig {
  if (offline) { // ** Connect to emulator
    const firebaseTest: any = firebaseFunctionsTest();
    testIndex++;
    const projectId = getTestingProjectId();
    // initialize test database
    process.env.GCLOUD_PROJECT = projectId;
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    const app = admin.initializeApp({ projectId });
    firebaseTest.firebaseConfig = { projectId, app };
    return firebaseTest;
  }

  const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const testObj: FeaturesList = firebaseFunctionsTest({ ...firebaseEnv(), ...overrideConfig }, pathToServiceAccountKey);
  // tslint:disable-next-line: no-eval
  const runtimeConfig = eval('require')(resolve(process.cwd(), './.runtimeconfig.json'));
  testObj.mockConfig(runtimeConfig);
  return testObj;
}

export function getTestingProjectId() {
  // projectId cannot have '.' in the string; need whole numbers
  return 'test' + testIndex;
}

type ExtractPromise<T> = T extends Promise<infer I> ? I : never;
type PromiseFirestore = ReturnType<typeof initFirestoreApp>;
export type Firestore = ExtractPromise<PromiseFirestore>;

export async function initFirestoreApp(
  projectId: string,
  rulePath: string,
  data: Record<string, Object> = {},
  auth?: TokenOptions
) {
  //Define these env vars to avoid getting console warnings
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  await setData(projectId, data);
  const app = initializeTestApp({ projectId, auth });
  await loadFirestoreRules({ projectId, rules: fs.readFileSync(rulePath, 'utf8') });

  return app.firestore();
}

function setData(projectId: string, dataDB: Record<string, Object>) {
  const app = initializeAdminApp({ projectId });
  const db = app.firestore();
  // Write data to firestore app
  const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
  return Promise.all(promises);
}


//////////////
// DB TOOLS //
//////////////

export function populate(collection: string, set: any[]) {
  const db = admin.firestore();
  return runChunks(set, async (d) => {
    const docRef = db.collection(collection).doc(d.id || d.uid);
    if (d.date?._seconds) { d.date = new Date(d.date._seconds * 1000) };
    if (d.end?._seconds) { d.end = new Date(d.end._seconds * 1000) };
    await docRef.set(d);
  }, 50, false)
}
