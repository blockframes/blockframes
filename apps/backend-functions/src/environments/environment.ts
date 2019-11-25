/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */
import * as functions from 'firebase-functions';

import { algolia as algoliaClient } from '@env';
export { factoryContract, backupBucket, relayer, appUrl, sentryDsn } from '@env';

/**
 * Helper to work in local / remote dev mode:
 * in local the function config will be empty and this function will return an undefined value.
 * Later, when we test the backend functions code, we'll let dev define env variables
 * for local testing.
 *
 * @param path the field path to look for, ['x', 'y'] will look for config.x.y
 */
const mockConfigIfNeeded = (...path: string[]): any =>
  path.reduce((config: any, field) => (config ? config[field] : undefined), functions.config());

export const sendgridAPIKey = mockConfigIfNeeded('sendgrid', 'api_key');
export const mnemonic = mockConfigIfNeeded('relayer', 'mnemonic');

export const algolia = {
  ...algoliaClient,
  adminKey: mockConfigIfNeeded('algolia', 'api_key')
};

export const adminEmail = mockConfigIfNeeded('admin', 'email');
export const adminPassword = mockConfigIfNeeded('admin', 'password');
