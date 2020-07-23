import { loadAdminServices } from './admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { getDocAndPath } from 'apps/backend-functions/src/media';
import objectPath from 'object-path';

/**
 * Sync firestore to storage, taking storage as the source of truth
 */
export async function syncStorage() {

  const { storage } = loadAdminServices();
  const bucket = storage.bucket(getStorageBucketName());
  const [files] = await bucket.getFiles();

  const promises = files.map(async file => {

    try {
      const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(file.name);

      if (!objectPath.has(docData, fieldToUpdate)) {
        throw new Error(`Lost File: no media field available in db`);
      }

      const [ signedUrl ] = await file.getSignedUrl({
        action: 'read',
        expires: '01-01-3000',
        version: 'v2'
      });

      // link the firestore
      // ! this will not work with array in the path like for poster
      return doc.update({[fieldToUpdate]: { ref: filePath, url: signedUrl } });
    } catch (error) {
      console.log(`An error happened when syncing ${file.name}!`, error.message);
    }
    
  })

  await Promise.all(promises);

}