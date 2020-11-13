/**
 * This environment uses all the configuration defined in the current @env setup,
 * AND loads secrets from the firebase's functions config object.
 *
 * Use this setup (production) when the execution context is within firebase functions.
 */
import * as functions from 'firebase-functions';

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

export const supportEmails: Record<string | 'default', string> = {
  catalog: functions.config().admin.email_catalog || functions.config().admin.email,
  festival: functions.config().admin.email_festival || functions.config().admin.email,
  financiers: functions.config().admin.email_financiers || functions.config().admin.email,
  default: functions.config().admin.email
} as const;

export const adminPassword = functions.config().admin.password;

export const jwplayerSecret = functions.config().jwplayer.secret;
export const jwplayerKey = functions.config().jwplayer.key;

export const imgixToken = functions.config().imgix.token;

export const twilioAccountSid = functions.config().twilio.account.sid;
export const twilioApiKeySecret = functions.config().twilio.api.key.secret;
export const twilioApiKeySid = functions.config().twilio.api.key.sid;

export const enableDailyFirestoreBackup = true;
