import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';

/**
 * Update all movies genre (old genres becomes keywords)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {

  const genresToKeyword = {
    periodDrama: 'Period Drama', 
    youngAdult: 'Young Adult',
    war: 'War', 
    police: 'Police',
    webSeries: 'Web Series', 
    wildlife: 'Wildlife',
    huntingFishing: 'Hunting & Fishing',
    archeologyHistory: 'Archeology & History',
    travelDiscovery: 'Travel & Discovery',
    natureEnvironment: 'Nature & Environment',
    fashion: 'Fashion',
    western: 'Western',
    tvShow: 'TV Show', 
    virtualReality: 'Virtual Reality' 
  }
  const genres = Object.keys(genresToKeyword);
  const movies = await db.collection('movies').get();

  return runChunks( 
    movies.docs,
    async (doc) => {
      const movie = doc.data();
      for (let i=0; i<=movie.genres.length; i++) {
        if (genres.includes(movie.genres[i])) {
          if (!Array.isArray(movie.keywords)) {
            movie.keywords = [];
          }
          movie.keywords.push(genresToKeyword[movie.genres[i]]);
          movie.genres.splice(i, 1);
        }
      }
      await doc.ref.set(movie);
    }
  ).catch(err => console.error(err));
}