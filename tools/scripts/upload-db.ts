import { backupBucket, firebase } from '../../env/env.ci';
import { existsSync } from 'fs';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();

admin.initializeApp({
  storageBucket: backupBucket,
  projectId: firebase.projectId,
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});
const storage = admin.storage();
const restore = join(process.cwd(), 'tmp', 'restore-ci.jsonl');

async function uploadDB() {
  try {
    // Ensure parent folder exist
    if(!existsSync(restore)) {
      throw new Error(`File ${restore} doesn't exist.`);
    }
    const destination = `${new Date().toISOString()}.jsonl`;
    await storage.bucket(backupBucket).upload(restore, { destination });
    console.log('Backup has been saved to:', destination);

  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach(error => console.error('ERROR:', error.message));
    } else{
      console.log(err)
    } 
  }
}

uploadDB().then(() => process.exit(0));