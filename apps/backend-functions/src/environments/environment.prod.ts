/**
 * This environment uses all the configuration defined in the current @env setup,
 * AND loads secrets from the firebase's functions config object.
 *
 * Use this setup (production) when the execution context is within firebase functions.
 */
import * as functions from 'firebase-functions';

import { algolia as algoliaClient } from '@env';
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
export const { storageBucket } = firebase;

export const sendgridAPIKey = functions.config().sendgrid.api_key;
export const mnemonic = functions.config().relayer.mnemonic;

export const algolia = {
  ...algoliaClient,
  adminKey: functions.config().algolia.api_key
};

export const adminEmail = functions.config().admin.email;
export const adminPassword = functions.config().admin.password;

export const jwplayerSecret = functions.config().jwplayer.secret;
export const jwplayerKey = functions.config().jwplayer.key;

export const imgixToken = functions.config().imgix.token;

export const twilioAccountSid = functions.config().twilio.account.sid;
export const twilioApiKeySecret = functions.config().twilio.api.key.secret;
export const twilioApiKeySid = functions.config().twilio.api.key.sid;
