/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */
import * as functions from 'firebase-functions';

export { factoryContract, backupBucket, relayer } from '@env';

export const sendgridAPIKey = functions.config().sendgrid.apiKey;
export const mnemonic = functions.config().relayer.mnemonic;
