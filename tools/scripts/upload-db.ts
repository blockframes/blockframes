import 'tsconfig-paths/register';
import { loadAdminServices } from '@blockframes/firebase-utils';
import { backupBucket } from '../../env/env.ci';
import { existsSync } from 'fs';
import { join } from 'path';

const ciStorage = loadAdminServices().ci.storage();
const restore = join(process.cwd(), 'tmp', 'restore-ci.jsonl');

async function uploadDB() {
  try {
    // Ensure parent folder exist
    if (!existsSync(restore)) {
      throw new Error(`File ${restore} doesn't exist.`);
    }
    const destination = `${new Date().toISOString()}-ANONYMIZED.jsonl`;
    await ciStorage.bucket(backupBucket).upload(restore, { destination });
    console.log(`Restore DB has been saved to: gs://${backupBucket}/${destination}`);
  } catch (err) {
    if ('errors' in err) {
      err.errors.forEach((error) => console.error('ERROR:', error.message));
    } else {
      console.log(err);
    }
  }
}

uploadDB().then(() => process.exit(0));
