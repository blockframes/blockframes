import { Firestore } from '@blockframes/firebase-utils';
import { Privacy } from '@blockframes/utils/file-sanitizer';
import { runChunks } from '../firebase-utils';

function createStorageFile(storagePath = '', privacy: Privacy) {
    return { storagePath, privacy }
}

/**
 * File Migration - Issue #4881
*/
export async function upgrade(db: Firestore) {

  // ORG
  const orgs = await db.collection('orgs').get();
  await runChunks(orgs.docs, async (orgDoc) => {
    const data = orgDoc.data()

    // documents.notes
    data.documents?.notes.map(note => note.ref = createStorageFile(note.ref, 'protected'));
    // logo
    data.logo = createStorageFile(data.logo, 'public');

    await orgDoc.ref.set(data);
  })

  // MOVIE
  const movies = await db.collection('movies').get()
  await runChunks(movies.docs, async (movieDoc) => {
    const data = movieDoc.data();

    // poster
    data.poster = createStorageFile(data.poster, 'public');
    // banner
    data.banner = createStorageFile(data.banner, 'public');
    // promotional.presentation_deck
    data.promotional.presentation_deck = createStorageFile(data.promotional.presentation_deck, 'public');
    // promotional.scenario
    data.promotional.scenario = createStorageFile(data.promotional.scenario, 'public');
    // promotional.moodboard
    data.promotional.moodboard = createStorageFile(data.promotional.moodboard, 'public');
    // promotional.still_photo
    data.promotional.still_photo = data.promotional.still_photo.map(still => createStorageFile(still, 'public'));
    if (!!data.promotional.videos) {
      // promotional.videos.screener
      if (!!data.promotional.videos.screener) {
        data.promotional.videos.screener.ref = createStorageFile(data.promotional.videos.screener.ref, 'protected');
      }
      // promotional.videos.otherVideos
      data.promotional.videos.otherVideos?.map(video => video.ref = createStorageFile(video.ref, 'public'));
    }
    // promotional.notes
    data.promotional.notes?.map(note => note.ref = createStorageFile(note.ref, 'public'))

    await movieDoc.ref.set(data);
  })

  // PROFILE
  const users = await db.collection('users').get()
  await runChunks(users.docs, async (userDoc) => {
    const data = userDoc.data();

    // avatar
    data.avatar = createStorageFile(data.avatar, 'public')
    // watermark
    data.watermark = createStorageFile(data.watermark, 'public')

    await userDoc.ref.set(data);
  })
}