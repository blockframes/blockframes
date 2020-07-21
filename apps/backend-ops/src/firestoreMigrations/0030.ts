import { Firestore, Storage } from '../admin';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { _upsertWatermark } from 'apps/backend-functions/src/internals/watermark';
import { chunk } from 'lodash'
import { MovieDocument } from 'apps/backend-functions/src/data/types';
import { PromotionalElement } from '@blockframes/movie/+state/movie.model';

import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { PromotionalHostedMedia } from '@blockframes/movie/+state/movie.firestore';
import { HostedMedia } from '@blockframes/media/+state/media.model';

const rowsConcurrency = 10;

const EMPTY_REF: HostedMedia = { ref: '', url: '' };

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {
  console.log('//////////////');
  console.log('// Processing watermarks');
  console.log('//////////////');
  await db
    .collection('users')
    .get()
    .then(async users => await updateWatermarks(users, storage));


  console.log('//////////////');
  console.log('// Processing movies');
  console.log('//////////////');
  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies, storage));

  console.log('Updated watermark.');
}

async function updateWatermarks(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  _: Storage
) {
  return runChunks(users.docs, async (doc) => {
    const updatedUser = await updateUserWaterMark(doc.data() as PublicUser);
    await doc.ref.set(updatedUser);
  });
}

const updateUserWaterMark = async (user: PublicUser) => {
  try {
    const watermark = await _upsertWatermark(user);
    user.watermark = watermark;
  } catch (e) {
    console.log(`Error while updating user ${user.uid} watermark. Reason: ${e.message}`);
  }

  return user;
};

async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    movies.docs.map(async doc => {
      const movie = doc.data() as MovieDocument;

      const keys = ['presentation_deck', 'scenario'];
      // We search for pdf that are not in the good directory
      for (const key of keys) {
        if (!!movie.promotionalElements[key]) {

          const value: PromotionalHostedMedia = movie.promotionalElements[key];
          if (value.media.url.includes(`movie%2F${movie.id}%2F`)) { // shoud be movies with an "s"
            movie.promotionalElements[key] = await updateMovieField(value, storage, movie.id);
          }

        }
      }

      await doc.ref.set(movie);
    })
  );
}

const updateMovieField = async <T extends PromotionalElement>(
  value: T,
  storage: Storage,
  movieId: string,
): Promise<T> => {
  const newImageRef = await changeResourceDirectory(value, storage, movieId);
  value['media'] = newImageRef;
  return value;
}

async function runChunks(docs, cb) {
  const chunks = chunk(docs, rowsConcurrency);
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    const promises = c.map(cb);
    await Promise.all(promises);
  }
}


const changeResourceDirectory = async (
  element: PromotionalElement,
  storage: Storage,
  movieId: string
): Promise<HostedMedia> => {

  // get the current ref
  const media = element['media'];

  // ### get the old file
  const { url } = media as HostedMedia;

  // ### copy it to a new location
  const bucket = storage.bucket(getStorageBucketName());

  try {
    const fileName = url.split('%2F').pop().split('?').shift();

    let newRef = '';
    let oldRef = '';
    if (url.includes(`movie%2F${movieId}%2FPresentationDeck`)) {
      oldRef = `movie/${movieId}/PresentationDeck/${fileName}`;
      newRef = `movies/${movieId}/promotionalElements.presentation_deck.media/${fileName}`;
    } else if (url.includes(`movie%2F${movieId}%2FScenario`)) {
      oldRef = `movie/${movieId}/Scenario/${fileName}`;
      newRef = `movies/${movieId}/promotionalElements.scenario.media/${fileName}`;
    } else {
      // @TODO (#3175) is there other cases  ?
      console.log('@TODO (#3175) is there other cases ?');
    }

    const to = bucket.file(newRef);
    const from = bucket.file(oldRef);

    const [exists] = await from.exists();

    if (exists) {
      console.log(`copying ${oldRef} to ${newRef}`);
      await from.copy(to);
      console.log('copy OK');

      const [signedUrl] = await to.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

      // delete previous image
      await from.delete();
      console.log('Removed previous');

      media.url = signedUrl;
      media.ref = newRef;
      return media;
    } else {
      console.log(`Empty ref for : ${movieId}`);
      return EMPTY_REF;
    }

  } catch (e) {
    console.log(`Error : ${e.message}`);
    return EMPTY_REF;
  }
}