import * as admin from 'firebase-admin';
import firebaseFunctionsTest from 'firebase-functions-test';
import { runChunks } from '@blockframes/firebase-utils';
import { join, resolve } from 'path';
import { config } from 'dotenv';
import { firebase as firebaseEnv } from '@env';
import {
  initializeTestApp,
  loadFirestoreRules,
  initializeAdminApp,
} from '@firebase/testing';
import type { FeaturesList } from 'firebase-functions-test/lib/features';
import type { AppOptions } from 'firebase-admin'; // * Correct Import
import fs from 'fs';
import { TokenOptions } from '@firebase/testing/dist/src/api';

export interface FirebaseTestConfig extends FeaturesList {
  firebaseConfig?: { projectId: string; app: admin.app.App };
}

let testIndex = 0;
config();

/**
 * Helper function that sets up `firebase-functions-test` using environment
 * config.
 * @param emulator if set to true, tests will use firestore emulator
 * @param overrideConfig allows custom configuration of test object
 * @returns firebase-functions-test mock object
 */
export function initFunctionsTestMock(
  emulator = true,
  overrideConfig?: AppOptions
): FirebaseTestConfig {
  let runtimeConfig: any = {};
  try {
    // tslint:disable-next-line: no-eval
    runtimeConfig = eval('require')(join(process.cwd(), './.runtimeconfig.json'));
  } catch (e) {
    console.log(e);
  }
  if (emulator) {
    // ** Connect to emulator
    const firebaseTest: FirebaseTestConfig = firebaseFunctionsTest();
    testIndex++;
    const projectId = getTestingProjectId();
    // initialize test database
    process.env.GCLOUD_PROJECT = projectId;
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    const app = admin.initializeApp({ projectId });
    firebaseTest.mockConfig(runtimeConfig);
    firebaseTest.firebaseConfig = { projectId, app };
    return firebaseTest;
  }

  const pathToServiceAccountKey = resolve(
    process.cwd(),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  const testObj: FeaturesList = firebaseFunctionsTest(
    { ...firebaseEnv(), ...overrideConfig },
    pathToServiceAccountKey
  );
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
  data: Record<string, unknown> = {},
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

function setData(projectId: string, dataDB: Record<string, unknown>) {
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
  return runChunks(
    set,
    async (d) => {
      const docRef = db.collection(collection).doc(d.id || d.uid);
      if (d.date?._seconds) {
        d.date = new Date(d.date._seconds * 1000);
      }
      if (d.end?._seconds) {
        d.end = new Date(d.end._seconds * 1000);
      }
      if (d._meta?.createdAt?._seconds) {
        d._meta.createdAt = new Date(d._meta.createdAt._seconds * 1000);
      }
      await docRef.set(d);
    },
    50,
    false
  );
}
