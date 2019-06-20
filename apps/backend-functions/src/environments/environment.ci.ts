/**
 * This environment uses all the configuration defined in the current @env setup.
 */
import * as functions from 'firebase-functions';

export { backupBucket, relayer, firebase } from '@env';

export const sendgridAPIKey = functions.config().sendgrid.apiKey;
export const mnemonic = functions.config().relayer.mnemonic;
