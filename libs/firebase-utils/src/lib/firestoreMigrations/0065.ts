import { runChunks } from '../firebase-utils';
import { Firestore } from '../types';
import { OldMovieDocument } from './old-types';



/**
 * Clean some unused collections or document attributes
 * @param db 
 * @returns 
 */
export async function upgrade(db: Firestore) {

  // Remove publicContracts collection
  const publicContracts = await db.collection('publicContracts').get();
  await runChunks(publicContracts.docs, async (doc) => {
    await doc.ref.delete();
  });

  // Remove movie.promotional.financialDetails
  const movies = await db.collection('movies').get();
  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as OldMovieDocument;

    delete movie.promotional.financialDetails;
    delete movie.promotional.clip_link;
    delete movie.promotional.promo_reel_link;
    delete movie.promotional.screener_link;
    delete movie.promotional.teaser_link;
    delete movie.promotional.trailer_link;
    delete movie.promotional.other_links;

    await doc.ref.set(movie);
  });

}