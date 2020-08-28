import 'tsconfig-paths/register';
import { restoreStorageFromCi } from '@blockframes/firebase-utils';
import { firebase as firebaseCI } from 'env/env.ci';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

if (!('FIREBASE_CI_SERVICE_ACCOUNT' in process.env)) {
  throw new Error('Key "FIREBASE_CI_SERVICE_ACCOUNT" does not exist in .env');
}

type Cert = string | admin.ServiceAccount;
let cert: Cert;
try {
  // If service account is a stringified json object
  cert = JSON.parse(process.env.FIREBASE_CI_SERVICE_ACCOUNT as string);
} catch (err) {
  // If service account is a path
  cert = process.env.FIREBASE_CI_SERVICE_ACCOUNT as admin.ServiceAccount;
}

const ciApp = admin.initializeApp(
  {
    projectId: firebaseCI.projectId,
    credential: admin.credential.cert(cert),
  },
  'CI-app'
);
restoreStorageFromCi(ciApp);
