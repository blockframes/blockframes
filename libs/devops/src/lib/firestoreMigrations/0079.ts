import { Firestore, runChunks } from '@blockframes/firebase-utils';

/**
 * Remove isBlockchainEnabled from org documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await updateTermsMedias(db);
  return await updateBucketsMedias(db);
}

async function updateTermsMedias(db: Firestore) {
  const terms = await db.collection('terms').get();

  return runChunks(terms.docs, async (doc) => {
    const term = doc.data();

    // remove media 'video'
    term.medias = term.medias.filter(media => media !== 'video');

    // rename media 'Planes' to Inflight
    term.medias = term.medias.map(media => media === 'planes' ? 'inflight' : media);

    // Update terms in DB
    await doc.ref.set(term);
  }).catch(err => console.error(err));
}

async function updateBucketsMedias(db: Firestore) {
  const buckets = await db.collection('buckets').get();

  return runChunks(buckets.docs, async (doc) => {
    const bucket = doc.data();

    bucket.contracts = bucket.contracts.map(contract => {
      contract.terms.map(term => {
        term.medias = term.medias
          // rename media 'Planes' to Inflight
          .map(media => media === 'planes' ? 'inflight' : media)
          // remove media 'video'
          .filter(media => media !== 'video');
        return term;
      })
      return contract;
    })

    // Update buckets in DB
    await doc.ref.set(bucket);
  }).catch(err => console.error(err));
}
