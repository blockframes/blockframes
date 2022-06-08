import { Firestore, runChunks } from '@blockframes/firebase-utils';

/**
 * Remove isBlockchainEnabled from org documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await updateTermsMedias(db)
  return await updateBucketsMedias(db)
}

async function updateTermsMedias(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async (doc) => {
    const term = doc.data();
    const medias = term.medias

    // remove media 'video'
    const indexVideo = medias.indexOf('video')
    if (medias.includes('video')) {
      medias.splice(indexVideo, 1)
    }

    // rename media 'Planes' to Inflight
    const indexPlanes = medias.indexOf('planes')
    if (medias.includes('planes')) {
      medias.splice(indexPlanes, 1, 'Inflight')
    }

    term.medias = medias

    // Update terms in DB
    await doc.ref.set(term);
  }).catch(err => console.error(err));
}

async function updateBucketsMedias(db: Firestore) {
  const buckets = await db.collection('buckets').get();

  return runChunks(buckets.docs, async (doc) => {
    const bucket = doc.data();
    const contracts = bucket.contracts
    // check if bucket has contracts
    if (contracts.length > 0) {
      const terms = contracts.map(test => test.terms[0].medias)

      terms.map(media => {
        // rename media 'Planes' to Inflight
        if (media.includes('planes')) {
          const indexPlanes = media.indexOf('planes')
          media.splice(indexPlanes, 1, 'Inflight')
        }
        // remove media 'video'
        if (media.includes('video')) {
          const indexVideo = media.indexOf('video')
          media.splice(indexVideo, 1)
        }
        return media
      })
    }

    // Update buckets in DB
    await doc.ref.set(bucket);
  }).catch(err => console.error(err));
}
