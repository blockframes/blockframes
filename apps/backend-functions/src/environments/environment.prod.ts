/**
 * This environment uses all the configuration defined in the current @env setup,
 * AND loads secrets from the firebase's functions config object.
 *
 * Use this setup (production) when the execution context is within firebase functions.
 */
import * as functions from 'firebase-functions';


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
  playerId,
} from '@env';

import { firebase } from '@env';
export const { projectId, storageBucket } = firebase();

export const sendgridAPIKey = functions.config().sendgrid.api_key;
export const mnemonic = functions.config().relayer.mnemonic;

export const adminPassword = functions.config().admin.password;

export const jwplayerSecret = functions.config().jwplayer.secret;
export const jwplayerKey = functions.config().jwplayer.key;
export const jwplayerApiV2Secret = functions.config().jwplayer.apiv2secret;

export const imgixToken = functions.config().imgix.token;

export const twilioAccountSid = functions.config().twilio.account.sid;
export const twilioAccountSecret = functions.config().twilio.account.secret;
export const twilioApiKeySecret = functions.config().twilio.api.key.secret;
export const twilioApiKeySid = functions.config().twilio.api.key.sid;

export const mailchimpAPIKey = functions.config().mailchimp.api_key;
export const mailchimpServer = functions.config().mailchimp.server;
export const mailchimpListId = functions.config().mailchimp.list_id;

