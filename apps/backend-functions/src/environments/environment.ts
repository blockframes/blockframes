/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */
import { firebase } from '@env';
import * as functions from 'firebase-functions';

/**
 * Helper to work in local / remote dev mode:
 * in local the function config will be empty and this function will return an undefined value.
 * Later, when we test the backend functions code, we'll let dev define env variables
 * for local testing.
 *
 * @param path the field path to look for, ['x', 'y'] will look for config.x.y
 */
const mockConfigIfNeeded = (...path: string[]): any =>
  path.reduce((config: any, field) => (config ? config[field] : undefined), functions.config()); // TODO! This is terrible why use reduce?

export const e2eMode = false;

export {
  production,
  backupBucket,
  appUrl,
  sentryEnv,
  sentryDsn,
  bigQueryAnalyticsTable,
  centralOrgId,
  supportEmails,
  jwplayer,
  mailchimp
} from '@env';

export const { projectId, storageBucket } = firebase();

export const sendgridAPIKey = mockConfigIfNeeded('sendgrid', 'api_key');

export const jwplayerSecret = mockConfigIfNeeded('jwplayer', 'secret');
export const jwplayerApiV2Secret = mockConfigIfNeeded('jwplayer', 'apiv2secret');

export const imgixToken = mockConfigIfNeeded('imgix', 'token');

export const twilioAccountSid = mockConfigIfNeeded('twilio', 'account', 'sid');
export const twilioAccountSecret = mockConfigIfNeeded('twilio', 'account', 'secret');
export const twilioApiKeySecret = mockConfigIfNeeded('twilio', 'api', 'key', 'secret');
export const twilioApiKeySid = mockConfigIfNeeded('twilio', 'api', 'key', 'sid');

export const mailchimpAPIKey = mockConfigIfNeeded('mailchimp', 'api_key');