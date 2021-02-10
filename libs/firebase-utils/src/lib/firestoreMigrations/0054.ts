import { Firestore } from '@blockframes/firebase-utils';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { runChunks } from '../firebase-utils';
import { getDeepValue } from '@blockframes/utils/pipes/deep-key.pipe';

function createStorageFile(data: {
  storagePath: string,
  privacy: Privacy, 
  collection: 'orgs' | 'movies' | 'users' | 'campaigns',
  docId: string,
  field: string,
  [k: string]: any
}) {
  if (!!data.ref) delete data.ref;
  if (!data.storagePath) data.storagePath = '';
  return data;
}

/**
 * File Migration - Issue #4881
*/
export async function upgrade(db: Firestore) {

  // ORG
  const orgs = await db.collection('orgs').get();
  await runChunks(orgs.docs, async (orgDoc) => {
    const data = orgDoc.data();

    // documents.notes
    if (!!data.documents) {
      data.documents.notes = data.documents.notes.map((note, i) => {
        return createStorageFile({
          storagePath: note.ref,
          privacy: 'protected',
          collection: 'orgs',
          docId: data.id,
          field: `documents.notes.[${i}]`,
          ...note
        });
      })
    }
    // logo
    data.logo = createStorageFile({
      storagePath: data.logo,
      privacy: 'public',
      collection: 'orgs',
      docId: data.id,
      field: 'logo',
    });

    await orgDoc.ref.set(data);
  })

  // MOVIE
  const movies = await db.collection('movies').get()
  await runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data();

    const fields = ['poster', 'banner'];
    fields.forEach(field => {
      data[field] = createStorageFile({
        storagePath: data[field],
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field
      })
    })

    const promotionalFields = ['financialDetails', 'presentation_deck', 'scenario', 'moodboard'];
    promotionalFields.forEach(field => {
      data.promotional[field] = createStorageFile({
        storagePath: getDeepValue(data, `promotional.${field}`),
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.${field}`
      })
    })

    // promotional.still_photo
    data.promotional.still_photo = data.promotional.still_photo.map((still, i) => createStorageFile({
      storagePath: still,
      privacy: 'public',
      collection: 'movies',
      docId: data.id,
      field: `promotional.still_photo.[${i}]`
    }));

    // promotional.salesPitch
    if (!!data.promotional.salesPitch) {
      data.promotional.salesPitch = createStorageFile({
        storagePath: data.promotional.salesPitch.ref,
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.salesPitch`,
        ...data.promotional.salesPitch
      })
    }
  
    if (!!data.promotional.videos) {
      // promotional.videos.screener
      if (!!data.promotional.videos.screener) {
        data.promotional.videos.screener = createStorageFile({
          storagePath: data.promotional.videos.screener.ref,
          privacy: 'protected',
          collection: 'movies',
          docId: data.id,
          field: `promotional.videos.screener`,
          ...data.promotional.videos.screener
        });
      }

      // promotional.videos.otherVideos
      if (!!data.promotional.videos.otherVideos) {
        data.promotional.videos.otherVideos = data.promotional.videos.otherVideos.map((video, i) => createStorageFile({
          storagePath: video.ref,
          privacy: 'public',
          collection: 'movies',
          docId: data.id,
          field: `promotional.videos.otherVideos.[${i}]`,
          ...video
        }));
      }
    }

    // promotional.notes
    if (!!data.promotional.notes) {
      data.promotional.notes = data.promotional.notes.map((note, i) => createStorageFile({
        storagePath: note.ref,
        privacy: 'public',
        collection: 'movies',
        docId: data.id,
        field: `promotional.notes.[${i}]`,
        ...note
      }))
    }

    await movieDoc.ref.set(data);
  })

  // CAMPAIGN
  const campaigns = await db.collection('campaigns').get();
  await runChunks(campaigns.docs, async (campaignDoc) => {
    const data = campaignDoc.data();

    const fields = ['budget', 'financingPlan', 'waterfall'];
    fields.forEach(field => {
       data.files[field] = createStorageFile({
        storagePath: getDeepValue(data, `files.${field}`),
        privacy: 'public',
        collection: 'campaigns',
        docId: data.id,
        field: `files.${field}`
      })
    })

    await campaignDoc.ref.set(data);
  })

  // USER
  const users = await db.collection('users').get();
  await runChunks(users.docs, async (userDoc) => {
    const data = userDoc.data();

    const fields = ['avatar', 'watermark'];
    fields.forEach(field => {
      data[field] = createStorageFile({
        storagePath: data[field],
        privacy: 'public',
        collection: 'users',
        docId: data.uid,
        field
      })
    })

    await userDoc.ref.set(data)
  })
}