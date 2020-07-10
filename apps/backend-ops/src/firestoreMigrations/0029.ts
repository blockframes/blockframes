import { Firestore, Storage } from '../admin';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { _upsertWatermark } from 'apps/backend-functions/src/internals/watermark';
import { chunk } from 'lodash'
import { MovieDocument } from 'apps/backend-functions/src/data/types';
import { PromotionalElement } from '@blockframes/movie/+state/movie.model';
import { ImgRef } from '@blockframes/media/+state/media.firestore';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { get } from 'https';

const rowsConcurrency = 10;

const EMPTY_REF: ImgRef = {
  ref: '',
  urls: { original: '' }
};


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
    .then(async movies => await updateMovies(movies, storage)); // @TODO (#3175) not working

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

          const value: PromotionalElement = movie.promotionalElements[key];
          if (value.media.urls.original.includes(`movie%2F${movie.id}%2F`)) { // shoud be movies with an "s"
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
  const newImageRef = await updateImgRef(value, storage, movieId);
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


const updateImgRef = async (
  element: PromotionalElement,
  storage: Storage,
  movieId: string
): Promise<ImgRef> => {

  // get the current ref
  const media = element['media'];

  // ### get the old file
  const { ref, urls } = media as ImgRef;

  // ### copy it to a new location
  const bucket = storage.bucket(getStorageBucketName());

  try {
    const fileName = ref.split('/').pop();

    let newPath = '';
    if( fileName.includes(`movie%2F${movieId}%2FPresentationDeck`) || fileName.includes(`movies%2F${movieId}%2FpromotionalElements.presentation_deck.media%2F${fileName}`)){
      newPath = `movies/${movieId}/promotionalElements.presentation_deck.media/${fileName}`;
    } else if( fileName.includes(`movie%2F${movieId}%2FScenario`) || fileName.includes(`movies%2F${movieId}%2FpromotionalElements.scenario.media%2F${fileName}`)){
      newPath = `movies/${movieId}/promotionalElements.scenario.media/${fileName}`;
    } else {
      // @TODO (#3175) is there other cases ?
    }

    const to = bucket.file(newPath);
    // we try to download it directly from it's original url
    if (!!urls.original) {

      console.log(`downloading ${ref}`);

      await new Promise((resolve, reject) => {
        // create a write stream to save the image in google cloud storage
        const saveImage = to.createWriteStream({ contentType: 'image/jpeg' })
          .on('error', (err) => { console.log('save error', err); reject(err) })
          .once('finish', () => resolve());

        // download the image and save it
        get(urls.original, result => {
          result.pipe(saveImage);
        }).on('error', err => { console.log('fail to download because of', err); reject(err) });
      });

      console.log('download OK');

      const [signedUrl] = await to.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

      // delete previous image
      const from = bucket.file(ref);
      await from.delete();
      console.log('Removed previous');

      media.urls.original = signedUrl;
      return media;
    } else {
      console.log('Empty ref');
      return EMPTY_REF;
    }

  } catch (e) {
    console.log('Empty ref');
    return EMPTY_REF;
  }
}