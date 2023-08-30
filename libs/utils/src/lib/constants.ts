//* Used in backend functions and e2e
import { suffixE2ESupportEmail } from '@env';

export const testUsername = 'blockframes.dev';
export const testDomain = 'gmail.com';
// Suffix to limit conflicts between different runs (devs & CI)
export const e2eSupportEmail = `${testUsername}+support${suffixE2ESupportEmail}@${testDomain}`;

// Used to be compared against appVersion data stored in db ${META_COLLECTION_NAME}/${APP_DOCUMENT_NAME}`
export const appVersion = '4.6.4';
