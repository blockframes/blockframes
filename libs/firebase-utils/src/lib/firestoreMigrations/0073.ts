import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Movie, Genre } from '@blockframes/model';

/**
 * Update all movies genre (old genres becomes keywords)
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const genresToKeyword = {
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

  const genresToRemove = 'other';
  const genresToUpdate: Record<string, Genre> = {
    'science-fiction': 'scienceFiction',
    'periodPiece': 'periodDrama'
  };

  const removedGenres = Object.keys(genresToKeyword);
  const updatedGenres = Object.keys(genresToUpdate);
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;
    movie.genres = movie.genres.filter((genre: string) => genresToRemove !== genre);
    movie.genres = movie.genres.map(genre => updatedGenres.includes(genre) ? genresToUpdate[genre] : genre);
    const removed = movie.genres.filter(genre => removedGenres.includes(genre));
    const keywords: string[] = removed.map(genre => genresToKeyword[genre]);
    movie.keywords = Array.from(new Set([...movie.keywords, ...keywords]));
    movie.genres = movie.genres.filter(genre => !removedGenres.includes(genre));
    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}
