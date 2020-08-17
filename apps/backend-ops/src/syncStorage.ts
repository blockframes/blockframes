import { loadAdminServices } from './admin';
import { getStorageBucketName, db } from 'apps/backend-functions/src/internals/firebase';
import { getDocAndPath } from 'apps/backend-functions/src/media';
import { getCollection } from 'apps/backend-functions/src/data/internals';
import { has, get } from 'object-path';
import { startMaintenance, endMaintenance, isInMaintenance } from '@blockframes/firebase-utils';
import { PublicUser } from '@blockframes/user/types';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { Movie } from '@blockframes/movie/+state/movie.model';

enum mediaFieldType {
  single,
  record
}

// reference to the location of all hosted medias in the db
const mediaReferences = [
  {
    collection: 'users',
    fields: [
      { field: 'watermark', type: mediaFieldType.single },
      { field: 'avatar', type: mediaFieldType.single },
    ]
  },
  {
    collection: 'orgs',
    fields: [
      { field: 'logo', type: mediaFieldType.single }
    ]
  },
  {
    collection: 'movies',
    fields: [
      { field: 'banner', type: mediaFieldType.single },
      { field: 'poster', type: mediaFieldType.single },
      { field: 'promotional.still_photo', type: mediaFieldType.record },
      { field: 'promotional.presentation_deck', type: mediaFieldType.single },
      { field: 'promotional.scenario', type: mediaFieldType.single },
    ]
  }
];

/**
 * Sync firestore to storage, taking storage as the source of truth
 */
export async function syncStorage() {

  let startedMaintenance = false;
  if (!await isInMaintenance()) {
    startedMaintenance = true;
    await startMaintenance();
  }

  console.log('//////////////');
  console.log('// Deleting all media references in firestore');
  console.log('//////////////');

  for (const ref of mediaReferences) {
    const docs = await getCollection<PublicUser | Organization | Movie>(ref.collection);
    const unlinkPromises = [];

    for (const doc of docs) {
      const docId = isPublicUser(doc) ? doc.uid : doc.id;
      const docRef = db.collection(ref.collection).doc(docId);

      for (const field of ref.fields) {
        let data;

        switch (field.type) {
          case mediaFieldType.single:
            // single media
            data = '';
            break;
          case mediaFieldType.record:
            // record of media
            const record = get(doc, field.field);
            for (const key in record) {
              data = {};
              data[key] = '';
            }
            break;
          default:
            throw new Error('Unknown field type for media reference');
        }

        // ! this will not work with array in the path
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

  for (const file of files) {
    try {
      const { filePath, doc, docData, fieldToUpdate } = await getDocAndPath(file.name);

      if (!has(docData, fieldToUpdate)) {
        throw new Error(`Lost File: no media field available in db. Applies to file ${file.name}`);
      }

      const currentMediaValue = get(docData, fieldToUpdate);
      if (!!currentMediaValue) {
        throw new Error(`Duplicate File: reference is already set by another file. Applies to file ${file.name}`);
      }

      // link the firestore
      // ! this will not work with array in the path
      await doc.update({[fieldToUpdate]: filePath });
    } catch (error) {
      console.log(`An error happened when syncing ${file.name}!`, error.message);
    }
  }

  if (startedMaintenance) await endMaintenance();

}

function isPublicUser(data: PublicUser | Organization | Movie): data is PublicUser {
  return (<PublicUser>data).uid !== undefined;
}
