import * as admin from 'firebase-admin';
import firebaseFunctionsTest from 'firebase-functions-test';

import { resolve } from 'path';
import { config } from 'dotenv';
import { firebase } from '@env';
import type { FeaturesList } from 'firebase-functions-test/lib/features';
import type { AppOptions } from 'firebase-admin'; // * Correct Import

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
    let firebaseTest:any = firebaseFunctionsTest();
    //projectId cannot have '.' in the string; need whole numbers
    const projectId = 'test' + testIndex++;

    // initialize test database
    process.env.GCLOUD_PROJECT = projectId;
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId });
    firebaseTest['firebaseConfig'] = { projectId };
    return firebaseTest;
  }

  const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const testObj: FeaturesList = firebaseFunctionsTest({ ...firebase, ...overrideConfig }, pathToServiceAccountKey);
  const runtimeConfig = require(resolve(process.cwd(), './.runtimeconfig.json'));
  testObj.mockConfig(runtimeConfig);
  return testObj;
}
