import { loadAdminServices } from './admin';
import { getStorageBucketName, db } from 'apps/backend-functions/src/internals/firebase';
import { getDocAndPath } from 'apps/backend-functions/src/media';
import { getCollection } from 'apps/backend-functions/src/data/internals';
import { createHostedMedia, createImgRef } from '@blockframes/media/+state/media.model';
import objectPath from 'object-path';

/**
 * Sync firestore to storage, taking storage as the source of truth
 */
export async function syncStorage() {

  console.log('//////////////');
  console.log('// Deleting all media references in firestore');
  console.log('//////////////');

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

  for (const ref of mediaReferences) {
    const docs = await getCollection<any>(ref.collection);
    const promises = [];

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
        }

        // if (docId === 'oHdU7uVJvXjpkd2THvuV') console.log('data: ', data);
        const promise = docRef.update({[field.field]: data});
        promises.push(promise);
      }
    }

    await Promise.all(promises);
  
  }

  console.log('//////////////');
  console.log('// Recreating media references in firestore');
  console.log('//////////////');

  const { storage } = loadAdminServices();
  const bucket = storage.bucket(getStorageBucketName());
  const [files] = await bucket.getFiles();

  const promises = files.map(async file => {
    try {
      const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(file.name);

      if (!objectPath.has(docData, fieldToUpdate)) {

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

  await Promise.all(promises);

}

enum mediaFieldType {
  hostedMedia,
  imgRef,
  recordOfImgRefs
}