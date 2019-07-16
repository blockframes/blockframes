/**
 * This environment uses all the configuration defined in the current @env setup,
 * it assumes most secrets are defined in the process.env
 *
 * Use this setup (non-production) when the execution context is outside firebase
 * functions.
 */
export { factoryContract, backupBucket, relayer, appUrl, sendgridAPIKey, mnemonic } from '@env';
