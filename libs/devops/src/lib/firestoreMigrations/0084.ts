import { Firestore, removeAllSubcollections, runChunks } from '@blockframes/firebase-utils';
import { Movie } from '@blockframes/model';

/**
 * Remove DistributionRights sub-collection from old movies
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    // Remove Sub Collection
    const subCollection = await doc.ref.listCollections();

    if (subCollection !== []) {
      const batch = db.batch();
      await removeAllSubcollections(doc, batch, db, { verbose: false });
      await batch.commit();
    }

    // Update Certifications
    const movie = doc.data() as Movie;

    if (!movie?.certifications.length) return false;

    movie.certifications = movie.certifications.filter((c) => !['artEssai', 'awardedFilm'].includes(c));

    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}

