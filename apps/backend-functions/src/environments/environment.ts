/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */

export const e2eMode = false;

export {
  production,
  factoryContract,
  backupBucket,
  relayer,
  appUrl,
  sentryEnv,
  sentryDsn,
  bigQueryAnalyticsTable,
  centralOrgId,
  supportEmails,
  playerId
} from '@env';

import { firebase } from '@env';
import { mockConfigIfNeeded } from '@blockframes/firebase-utils';
export const { projectId, storageBucket } = firebase();

export const sendgridAPIKey = mockConfigIfNeeded('sendgrid', 'api_key');
export const mnemonic = mockConfigIfNeeded('relayer', 'mnemonic');

export const adminPassword = mockConfigIfNeeded('admin', 'password');

export const jwplayerSecret = mockConfigIfNeeded('jwplayer', 'secret');
export const jwplayerKey = mockConfigIfNeeded('jwplayer', 'key');
export const jwplayerApiV2Secret = mockConfigIfNeeded('jwplayer', 'apiv2secret');

export const imgixToken = mockConfigIfNeeded('imgix', 'token');

export const twilioAccountSid = mockConfigIfNeeded('twilio', 'account', 'sid');
export const twilioAccountSecret = mockConfigIfNeeded('twilio', 'account', 'secret');
export const twilioApiKeySecret = mockConfigIfNeeded('twilio', 'api', 'key', 'secret');
export const twilioApiKeySid = mockConfigIfNeeded('twilio', 'api', 'key', 'sid');

export const mailchimpAPIKey = mockConfigIfNeeded('mailchimp', 'api_key');
export const mailchimpServer = mockConfigIfNeeded('mailchimp', 'server');
export const mailchimpListId = mockConfigIfNeeded('mailchimp', 'list_id');

export const enableDailyFirestoreBackup = false;
