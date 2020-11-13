/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */

import { dev } from '@env';
export {
  factoryContract,
  backupBucket,
  relayer,
  appUrl,
  sentryEnv,
  sentryDsn,
  bigQueryAnalyticsTable,
  centralOrgID,
} from '@env';

import { firebase } from '@env';
import { mockConfigIfNeeded } from '@blockframes/firebase-utils';
export const { storageBucket } = firebase;

export const sendgridAPIKey = mockConfigIfNeeded('sendgrid', 'api_key');
export const mnemonic = mockConfigIfNeeded('relayer', 'mnemonic');

export const adminEmails: Record<string | 'default', string> = {
  catalog: dev ? mockConfigIfNeeded('admin', 'email_catalog'): 'developers+catalog@cascade8.com',
  festival: dev ? mockConfigIfNeeded('admin', 'email_festival'): 'developers+festival@cascade8.com',
  financiers: dev ? mockConfigIfNeeded('admin', 'email_financiers'): 'developers+financiers@cascade8.com',
  default: dev ? mockConfigIfNeeded('admin', 'email'): 'developers@cascade8.com'
} as const;

export const adminPassword = mockConfigIfNeeded('admin', 'password');

export const jwplayerSecret = mockConfigIfNeeded('jwplayer', 'secret');
export const jwplayerKey = mockConfigIfNeeded('jwplayer', 'key');

export const imgixToken = mockConfigIfNeeded('imgix', 'token');

export const twilioAccountSid = mockConfigIfNeeded('twilio', 'account', 'sid');
export const twilioApiKeySecret = mockConfigIfNeeded('twilio', 'api', 'key', 'secret');
export const twilioApiKeySid = mockConfigIfNeeded('twilio', 'api', 'key', 'sid');

export const enableDailyFirestoreBackup = false;
