import { functions } from './internals/firebase';
import { storeSearchableMovie, deleteSearchableMovie } from './internals/algolia';
import { MovieDocument } from './data/types';
import isEqual from 'lodash/isEqual';

export function onMovieCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  const movie = snap.data();
  const movieId = context.params.movieId;

  if (!movie || !movieId) {
    console.error('Invalid movie data:', movie);
    throw new Error('movie update function got invalid movie data');
  }
  // Update algolia's index
  return storeSearchableMovie(movie);
}

export function onMovieDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  // Update algolia's index
  return deleteSearchableMovie(context.params.movieId);
}

export function onMovieUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const before = change.before.data() as MovieDocument;
  const after = change.after.data() as MovieDocument;

  if (isEqual(before, after)) {
    console.error('No changes detected');
    throw new Error('movie update function got invalid movie data');
  }

  if (before.id !== after.id) {
    throw new Error('movie id can not be changed!');
  }

  return storeSearchableMovie(after);
}
