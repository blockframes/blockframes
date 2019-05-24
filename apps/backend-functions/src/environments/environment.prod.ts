/**
 * This environment uses all the configuration defined in the current @env setup,
 * AND loads secrets from the firebase's functions config object.
 *
 * Use this setup (production) when the execution context is within firebase functions.
 */
import * as functions from 'firebase-functions';

export { factoryContract, backupBucket, relayer } from '@env';

export const sendgridAPIKey = functions.config().sendgrid.apiKey;
export const mnemonic = functions.config().relayer.mnemonic;
