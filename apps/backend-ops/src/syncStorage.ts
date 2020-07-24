import { loadAdminServices } from './admin';
import { getStorageBucketName, db } from 'apps/backend-functions/src/internals/firebase';
import { getDocAndPath } from 'apps/backend-functions/src/media';
import { getCollection } from 'apps/backend-functions/src/data/internals';
import { createHostedMedia, createImgRef } from '@blockframes/media/+state/media.model';
import { has } from 'object-path';
import { startMaintenance, endMaintenance, isInMaintenance } from 'apps/backend-functions/src/maintenance';

enum mediaFieldType {
  hostedMedia,
  imgRef,
  recordOfImgRefs
}

// reference to the location of all medias in the db
const mediaReferences = [
  { 
    collection: 'users',
    fields: [
      { field: 'watermark', type: mediaFieldType.hostedMedia },
      { field: 'avatar', type: mediaFieldType.imgRef },
    ]
  },
  { 
    collection: 'orgs', 
    fields: [
      { field: 'logo', type: mediaFieldType.imgRef }
    ]
  },
  {
    collection: 'movies',
    fields: [
      { field: 'main.banner.media', type: mediaFieldType.imgRef }, // TODO issue #3291
      { field: 'main.poster.media', type: mediaFieldType.imgRef }, // TODO issue #3291
      { field: 'promotionalElements.still_photo', type: mediaFieldType.recordOfImgRefs }
    ]
  }
];

/**
 * Sync firestore to storage, taking storage as the source of truth
 */
export async function syncStorage() {

  let startedMaintenance: boolean = false;
  if (!await isInMaintenance()) {
    startedMaintenance = true;
    await startMaintenance();
  }

  console.log('//////////////');
  console.log('// Deleting all media references in firestore');
  console.log('//////////////');

  for (const ref of mediaReferences) {
    const docs = await getCollection<any>(ref.collection);
    const unlinkPromises = [];

    for (const doc of docs) {
      const docId = doc.id ? doc.id : doc.uid;
      const docRef = db.collection(ref.collection).doc(docId);
      
      for (const field of ref.fields) {
        let data; 

        switch (field.type) {
          case mediaFieldType.hostedMedia:
            // media field without different sizes
            data = createHostedMedia();
            break;
          case mediaFieldType.imgRef:
            // media field with different sizes
            data = createImgRef();
            break;
          case mediaFieldType.recordOfImgRefs:
            // media field with multiple medias
            data = {};
            break;
          default:
            throw new Error('Unknown field type for media reference');
        }

        const promise = docRef.update({[field.field]: data});
        unlinkPromises.push(promise);
      }
    }

    await Promise.all(unlinkPromises);
  
  }

  console.log('//////////////');
  console.log('// Recreating media references in firestore');
  console.log('//////////////');

  const { storage } = loadAdminServices();
  const bucket = storage.bucket(getStorageBucketName());
  const [files] = await bucket.getFiles();

  const linkPromises = files.map(async file => {
    try {
      const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(file.name);

      if (!has(docData, fieldToUpdate)) {

        // OPTION 1
        // exclude records of imgRefs from not finding a record because it will never exist.
        const records = []
        mediaReferences.forEach(ref => {
          ref.fields.forEach(field => {
            if (field.type === mediaFieldType.recordOfImgRefs) {
              records.push(field.field);
            }
          })
        })

        if (!records.some(record => file.name.includes(record))) { 
          throw new Error(`Lost File: no media field available in db`);
        }

        // OPTION 2
        // Empty the references in the record; delete the empty ones at the end of the script?
        // If we dont delete the empty references, its ugly in the front-end.
        
        // OPTION 3
        // Check whether the path to the records exists but delete all the references in it.
        // If the path to the records doesnt exist, then it is a lost file
        // If it does exist, then the files can be added to the record
        // e.g. Only check if promotionalElements.still_photo exists, but not check if promotionalElements.still_photo.0.media exists.

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
  });

  await Promise.all(linkPromises);

  if (startedMaintenance) await endMaintenance();

}
