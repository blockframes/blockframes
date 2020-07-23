import { Firestore, Storage } from '../admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { PromotionalHostedMedia } from '@blockframes/movie/+state/movie.firestore';
import { HostedMedia } from '@blockframes/media/+state/media.model';
import { File as GFile, Bucket } from '@google-cloud/storage';
import { getDocument } from 'apps/backend-functions/src/data/internals';

const EMPTY_REF: HostedMedia = { ref: '', url: '' };

export async function upgrade(db: Firestore, storage: Storage) {

  console.log('//////////////');
  console.log('// [DB] Processing Users');
  console.log('//////////////');
  await db
    .collection('users')
    .get()
    .then(async users => await updateUsers(users, storage));

  console.log('Updated users.');

  console.log('//////////////');
  console.log('// [DB] Processing Orgs');
  console.log('//////////////');
  await db
    .collection('orgs')
    .get()
    .then(async orgs => await updateOrgs(orgs, storage));

  console.log('Updated orgs.');

  console.log('//////////////');
  console.log('// [DB] Processing movies');
  console.log('//////////////');
  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies, storage));

  console.log('Updated movies.');

  console.log('//////////////');
  console.log('// [STORAGE] Processing movies');
  console.log('//////////////');

  const bucket = storage.bucket(getStorageBucketName());
  const cleanMoviesDirOutput = await cleanMoviesDir(bucket);
  console.log(`Cleaned ${cleanMoviesDirOutput.deleted}/${cleanMoviesDirOutput.total} from "movies" directory.`);

  console.log('//////////////');
  console.log('// [STORAGE] Processing users');
  console.log('//////////////');

  const cleanUsersDirOutput = await cleanUsersDir(bucket);
  console.log(`Cleaned ${cleanUsersDirOutput.deleted}/${cleanUsersDirOutput.total} from "users" directory.`);

  console.log('//////////////');
  console.log('// [STORAGE] Processing orgs');
  console.log('//////////////');

  const cleanOrgsDirOutput = await cleanOrgsDir(bucket);
  console.log(`Cleaned ${cleanOrgsDirOutput.deleted}/${cleanOrgsDirOutput.total} from "orgs" directory.`);
}

/**
 * Moves resources to the right folder on storage and updates
 * the model
 * @param users 
 * @param storage 
 */
async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    users.docs.map(async doc => {
      const user = doc.data() as any; // @TODO #(3175) create intermediary model

      if (user.avatar?.original?.ref) {
        const avatar = user.avatar?.original;
        user.avatar = await changeResourceDirectory(avatar, storage, user.uid);
      }
      await doc.ref.set(user);
    })
  );
}

/**
 * Moves resources to the right folder on storage and updates
 * the model
 * @param orgs 
 * @param storage 
 */
async function updateOrgs(
  orgs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    orgs.docs.map(async doc => {
      const org = doc.data() as any; // @TODO #(3175) create intermediary model

      if (org.logo?.original?.ref) {
        const logo = org.logo?.original;
        org.logo = await changeResourceDirectory(logo, storage, org.id);
      }
      await doc.ref.set(org);
    })
  );
}

/**
 * Moves resources to the right folder on storage and updates
 * the model
 * @param movies 
 * @param storage 
 */
async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    movies.docs.map(async doc => {
      const movie = doc.data() as any; // @TODO #(3175) create intermediary model

      if (movie.main.banner?.media?.original?.ref) {
        const banner = movie.main.banner;
        movie.main.banner = await changeResourceDirectory(banner.media.original, storage, movie.id);
      }

      if (movie.main.poster?.media?.original?.ref) {
        const poster = movie.main.poster;
        movie.main.poster = await changeResourceDirectory(poster.media.original, storage, movie.id);
      }

      if (!!movie.promotionalElements.still_photo) {
        for (const stillKey of Object.keys(movie.promotionalElements.still_photo)) {
          const still = movie.promotionalElements.still_photo[stillKey];
          movie.promotionalElements.still_photo[stillKey] = await changeResourceDirectory(still.media.original, storage, movie.id);
        }
      }

      const keys = ['presentation_deck', 'scenario'];
      // We search for pdf that are not in the good directory
      for (const key of keys) {
        if (!!movie.promotionalElements[key]) {

          const value: PromotionalHostedMedia = movie.promotionalElements[key];
          if (value.media?.url.includes(`movie%2F${movie.id}%2F`)) { // shoud be movies with a "s"
            movie.promotionalElements[key] = await changeResourceDirectory(value.media, storage, movie.id);
          }

        }
      }

      await doc.ref.set(movie);
    })
  );
}

const changeResourceDirectory = async (
  media: HostedMedia,
  storage: Storage,
  docId: string
): Promise<HostedMedia> => {

  // ### get the old file
  const { url, ref } = media;

  // ### copy it to a new location
  const bucket = storage.bucket(getStorageBucketName());

  try {
    const fileName = url.split('%2F').pop().split('?').shift();

    let newRef = '';
    let oldRef = '';
    if (url.includes(`movie%2F${docId}%2FPresentationDeck`)) {
      oldRef = `movie/${docId}/PresentationDeck/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotionalElements.presentation_deck/${fileName}`;
    } else if (url.includes(`movie%2F${docId}%2FScenario`)) {
      oldRef = `movie/${docId}/Scenario/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotionalElements.scenario/${fileName}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.banner.media`)) {
      oldRef = ref;
      newRef = `movies/${docId}/main.banner/${ref.split('/').pop()}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.poster`)) {
      oldRef = ref;
      newRef = `movies/${docId}/main.poster/${ref.split('/').pop().replace(/(\.|\[)[0-9]{1}\]?\./gi, '')}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.still_photo`)) {
      oldRef = ref;
      const regex = /(\.|\[)(?<value>[0-9]{1})\]?\./gi;
      const [_, __, index] = regex.exec(ref);
      newRef = `movies/${docId}/promotionalElements.still_photo/${index}/${ref.split('/').pop().replace(/(\.|\[)[0-9]{1}\]?\./gi, '')}`;
    } else if (ref.includes(`users/${docId}/avatar`)) {
      oldRef = ref;
      newRef = `users/${docId}/avatar/${ref.split('/').pop()}`;
    } else if (ref.includes(`orgs/${docId}/logo`)) {
      oldRef = ref;
      newRef = `orgs/${docId}/logo/${ref.split('/').pop()}`;
    } else {
      console.log(ref);
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
      console.log(`Ref ${ref} not found for : ${docId}`);
      return EMPTY_REF;
    }

  } catch (e) {
    console.log(`Error : ${e.message}`);
    return EMPTY_REF;
  }
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanMoviesDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movies/' }))[0];

  let deleted = 0;

  for (const f of files) {
    const movieId = f.name.split('/')[1];
    const movie = await getDocument<any>(`movies/${movieId}`); // w8 "final" movieDoc
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!movie && !findImgRefInMovie(movie, f.name)) {
      if (await f.delete()) { deleted++; }
    }
  }

  return { deleted, total: files.length };
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanUsersDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'users/' }))[0];
  let deleted = 0;

  for (const f of files) {
    const userId = f.name.split('/')[1];
    const user = await getDocument<any>(`users/${userId}`); // w8 "final" movieDoc
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!user && user.avatar?.ref !== f.name && user.watermark?.ref !== f.name) {
      if (await f.delete()) { deleted++; }
    }
  }

  return { deleted, total: files.length };
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanOrgsDir(bucket: Bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'orgs/' }))[0];
  let deleted = 0;

  for (const f of files) {
    const orgId = f.name.split('/')[1];
    const org = await getDocument<any>(`orgs/${orgId}`); // w8 "final" movieDoc
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!org && org.logo?.ref !== f.name) {
      if (await f.delete()) { deleted++; }
    }
  }

  return { deleted, total: files.length };
}


function isOriginal(file: GFile) {
  return getImgSize(file) === 'original';
}

function haveImgSize(file: GFile) {
  return getImgSize(file) !== '';
}

function getImgSize(file: GFile) {
  let size = '';
  ['lg', 'md', 'xs', 'fallback', 'original'].forEach(s => {
    if (file.name.includes(`/${s}/`)) {
      size = s;
    }
  });

  return size;
}

function findImgRefInMovie(movie: any, ref: string) { // w8 final moviedoc structure

  if (movie.main.banner?.ref === ref) {  // This is the "final" ImgRef structure
    return true;
  }

  if (movie.main.poster?.ref === ref) {  // This is the "final" ImgRef structure
    return true;
  }

  if (Object.values(movie.promotionalElements?.still_photo).some((p: any) => p.ref === ref)) {
    return true;
  }

  if (movie.promotionalElements.scenario?.ref === ref) {
    return true;
  };

  if (movie.promotionalElements.presentation_deck?.ref === ref) {
    return true;
  };

  return false;
}
