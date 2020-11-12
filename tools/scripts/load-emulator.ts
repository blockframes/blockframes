import 'tsconfig-paths/register';
import { config } from 'dotenv';
config();

import { restoreFromBackupBucket } from '@blockframes/firebase-utils';
import * as admin from 'firebase-admin';
import { firebase, backupBucket } from '@env'
import { initializeAdminApp } from '@firebase/rules-unit-testing'

const testAdmin = initializeAdminApp({projectId: firebase.projectId, databaseName: 'loademulator'})
const db = testAdmin.firestore()
const liveAdmin = admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: firebase.projectId });
const storage = liveAdmin.storage()
const bucket = storage.bucket(backupBucket)

restoreFromBackupBucket(bucket, db as any).then(() => process.exit(0))
