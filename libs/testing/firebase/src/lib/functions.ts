import * as firebaseTesting from '@firebase/testing'
import firebaseFunctionsTest from 'firebase-functions-test';
import { resolve } from 'path';
import { config } from 'dotenv'
import { firebase } from '@env'
import type { FeaturesList } from 'firebase-functions-test/lib/features';
import type { AppOptions } from 'firebase-admin'; // * Correct Import

config()

/**
 * Helper function that sets up `firebase-functions-test` using environment
 * config.
 * @param offline if set to true, tests will be offline-only
 * @param overrideConfig allows custom configuration of test object
 * @returns firebase-functions-test mock object
 */
export function initFunctionsTestMock(offline = false, overrideConfig?: AppOptions): FeaturesList {
  if (offline) return firebaseFunctionsTest();
  const pathToServiceAccountKey = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  const testObj: FeaturesList = firebaseFunctionsTest({ ...firebase, ...overrideConfig  }, pathToServiceAccountKey);
  const runtimeConfig = require(resolve(process.cwd(), './.runtimeconfig.json'));
  testObj.mockConfig(runtimeConfig);
  return testObj;
}
