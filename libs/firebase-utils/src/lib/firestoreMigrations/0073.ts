import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie } from '@blockframes/movie/+state';

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
  };
  const removedGenres = Object.keys(genresToKeyword);
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;
    const removed = movie.genres.filter(genre => removedGenres.includes(genre));
    const keywords: string[] = removed.map(genre => genresToKeyword[genre]);
    movie.keywords = Array.from(new Set([ ...movie.keywords, ...keywords ]));
    movie.genres =  movie.genres.filter(genre => !removedGenres.includes(genre));
    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}