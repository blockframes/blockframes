import * as admin from 'firebase-admin';
import * as firebaseTesting from '@firebase/testing'
import firebaseFunctionsTest from 'firebase-functions-test';

import { resolve } from 'path';
import { config } from 'dotenv'
import { firebase } from '@env'
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { AppOptions } from 'firebase-admin'; // * Correct Import

config()

/**
 * Helper function that sets up `firebase-functions-test` using environment
 * config.
 * @param offline if set to true, tests will be offline-only
 * @param overrideConfig allows custom configuration of test object
 * @returns firebase-functions-test mock object
 */
export function initFunctionsTestMock(offline = true, overrideConfig?: AppOptions): FeaturesList {
  if (offline) { // ** Connect to emulator
    const firebaseTest = firebaseFunctionsTest();
    const projectId = String(Math.random())

    // initialize test database
    process.env.GCLOUD_PROJECT = projectId;
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    admin.initializeApp({ projectId });
    return firebaseTest;
  }

  const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const testObj: FeaturesList = firebaseFunctionsTest({ ...firebase, ...overrideConfig  }, pathToServiceAccountKey);
  const runtimeConfig = require(resolve(process.cwd(), './.runtimeconfig.json'));
  testObj.mockConfig(runtimeConfig);
  return testObj;
}
