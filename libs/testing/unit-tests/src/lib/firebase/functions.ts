﻿import firebaseFunctionsTest from 'firebase-functions-test';
import { getDb, initAdmin, runChunks, SAK_VALUE } from '@blockframes/firebase-utils';
import type { FirebaseApp, AppOptions } from '@blockframes/firebase-utils/types';
import { join, resolve } from 'path';
import { config } from 'dotenv';
import { firebase as firebaseEnv } from '@env';
import { TokenOptions, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import type { FeaturesList } from 'firebase-functions-test/lib/features';
import fs from 'fs';

export interface FirebaseTestConfig extends FeaturesList {
  firebaseConfig?: { projectId: string, app: FirebaseApp };
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
export function initFunctionsTestMock(emulator = true, overrideConfig?: AppOptions): FirebaseTestConfig {
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
    const app = initAdmin({ projectId });
    firebaseTest.mockConfig(runtimeConfig);
    firebaseTest.firebaseConfig = { projectId, app };
    return firebaseTest;
  }

  const pathToServiceAccountKey = resolve(process.cwd(), SAK_VALUE());
  const testObj: FeaturesList = firebaseFunctionsTest({ ...firebaseEnv(), ...overrideConfig }, pathToServiceAccountKey);
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
  uid?: string,
  auth?: TokenOptions
) {
  //Define these env vars to avoid getting console warnings
  process.env.GCLOUD_PROJECT = projectId;
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync(rulePath, 'utf8') }
  });

  const db = uid ? testEnv.authenticatedContext(uid, auth) : testEnv.unauthenticatedContext();
  await setData(testEnv, data);
  return db.firestore();
}

function setData(testEnv: RulesTestEnvironment, dataDB: Record<string, unknown>) {
  return new Promise<void>(resolve => {
    testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      // Write data to firestore app
      const promises = Object.entries(dataDB).map(([key, doc]) => db.doc(key).set(doc));
      await Promise.all(promises);
      resolve();
    });
  });
}

//////////////
// DB TOOLS //
//////////////

export function populate(collection: string, set: any[]) {
  const db = getDb();
  return runChunks(set, async (d) => {
    const docRef = db.collection(collection).doc(d.id || d.uid);
    await docRef.set(d);
  }, 50, false)
}
