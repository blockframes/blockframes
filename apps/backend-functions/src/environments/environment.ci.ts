/**
 * This environment uses all the configuration defined in the current @env setup.
 */
import * as functions from 'firebase-functions';

export { backupBucket, relayer, firebase, appUrl } from '@env';

export const sendgridAPIKey = functions.config().sendgrid.apiKey;
export const mnemonic = functions.config().relayer.mnemonic;

export const algoliaId = functions.config().algolia.app_id;
export const algoliaAdminKey = functions.config().algolia.api_key;
export const algoliaSearchKey = functions.config().algolia.search_key;

export const adminEmail = functions.config().admin.email;
