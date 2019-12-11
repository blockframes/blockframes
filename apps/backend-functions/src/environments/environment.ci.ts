/**
 * This environment uses all the configuration defined in the current @env setup.
 */
import * as functions from 'firebase-functions';

import { algolia as algoliaClient } from '@env';
export { backupBucket, relayer, firebase, appUrl, sentryDsn } from '@env';

export const sendgridAPIKey = functions.config().sendgrid.api_key;
export const mnemonic = functions.config().relayer.mnemonic;

export const algolia = {
  ...algoliaClient,
  adminKey: functions.config().algolia.api_key
};

export const adminEmail = functions.config().admin.email;
export const adminPassword = functions.config().admin.password;
