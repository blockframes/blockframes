/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */
 import { config } from 'firebase-functions';
 import { firebase } from '@env';
 import { mockConfigIfNeeded } from '@blockframes/firebase-utils/firebase-utils';
 import { initFunctionsTestMock } from '@blockframes/testing/unit-tests';


 initFunctionsTestMock();
 console.log('Functions config() output: ')
 const test = config();
 console.log(test);
 console.log(test?.twilio?.api?.key);



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
  playerId,
} from '@env';

export const { projectId, storageBucket } = firebase();

export const sendgridAPIKey = mockConfigIfNeeded('sendgrid', 'api_key');

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