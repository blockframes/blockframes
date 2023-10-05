/**
 * This environment uses all the configuration defined in the current @env setup,
 * AND loads secrets from the firebase's functions config object.
 *
 * Use this setup (production) when the execution context is within firebase functions.
 */
import * as functions from 'firebase-functions';

export const e2eMode = true;
console.log('Emulator Mode enabled for functions');

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
  mailchimp,
  airtable
} from '@env';

import { firebase } from '@env';
export const { projectId, storageBucket } = firebase();

export const sendgridAPIKey = functions.config().sendgrid.api_key;

export const jwplayerSecret = functions.config().jwplayer.secret;
export const jwplayerApiV2Secret = functions.config().jwplayer.apiv2secret;

export const imgixToken = functions.config().imgix.token;

export const twilioAccountSid = functions.config().twilio.account.sid;
export const twilioAccountSecret = functions.config().twilio.account.secret;
export const twilioApiKeySecret = functions.config().twilio.api.key.secret;
export const twilioApiKeySid = functions.config().twilio.api.key.sid;

export const mailchimpAPIKey = functions.config().mailchimp.api_key;

export const airtableToken = functions.config().airtable.token;
