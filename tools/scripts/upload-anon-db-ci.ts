import 'tsconfig-paths/register';
import { loadAdminServices, catchErrors, latestAnonDbFilename } from '@blockframes/firebase-utils';
import { backupBucket } from '../../env/env.ci';
import { existsSync } from 'fs';
import { join } from 'path';

const ciStorage = loadAdminServices().getCI().storage();
const restore = join(process.cwd(), 'tmp', 'restore-ci.jsonl');

async function uploadDB() {
  // Ensure parent folder exist
  if (!existsSync(restore)) {
    throw new Error(`File ${restore} doesn't exist.`);
  }
  const destination = latestAnonDbFilename;
  await ciStorage.bucket(backupBucket).upload(restore, { destination });
  console.log(`Restore DB has been saved to: gs://${backupBucket}/${destination}`);
}

catchErrors(uploadDB).then(() => process.exit(0));
