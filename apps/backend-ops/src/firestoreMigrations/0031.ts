import { Firestore, Storage } from '../admin';
import { PromotionalHostedMedia } from '@blockframes/movie/+state/movie.firestore';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';
import { File as GFile } from '@google-cloud/storage';
import { startMaintenance, endMaintenance, getDocument, runChunks } from '@blockframes/firebase-utils';
import { firebase } from '@env';
export const { storageBucket } = firebase;

const EMPTY_REF = '';

export async function upgrade(db: Firestore, storage: Storage) {
  await startMaintenance();

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

  const bucket = storage.bucket(storageBucket);
  const cleanMoviesDirOutput = await cleanMoviesDir(bucket);
  console.log(`Cleaned ${cleanMoviesDirOutput.deleted}/${cleanMoviesDirOutput.total} from "movies" directory.`);

  const cleanMovieDirOutput = await cleanMovieDir(bucket);
  console.log(`Cleaned ${cleanMovieDirOutput.deleted}/${cleanMovieDirOutput.total} from "movie" directory.`);

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

  await endMaintenance();
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
  return runChunks(users.docs, async (doc) => {
    const user = doc.data() as any; // @TODO #(3175) create intermediary model

    if (user.avatar?.ref) {
      const avatar = user.avatar;
      user.avatar = await changeResourceDirectory(avatar, storage, user.uid);
    } else {
      user.avatar = '';
    }

    user.watermark = '';

    await doc.ref.set(user);
  });

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
  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as any; // @TODO #(3175) create intermediary model

    if (org.logo?.ref) {
      const logo = org.logo;
      org.logo = await changeResourceDirectory(logo, storage, org.id);
    } else {
      org.logo = '';
    }
    await doc.ref.set(org);
  });

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
  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as any; // @TODO #(3175) create intermediary model

    if (movie.main.banner?.media?.ref) {
      const banner = movie.main.banner;
      movie.main.banner = await changeResourceDirectory(banner.media, storage, movie.id);
    } else {
      movie.main.banner = '';
    }

    if (movie.main.poster?.media?.ref) {
      const poster = movie.main.poster;
      movie.main.poster = await changeResourceDirectory(poster.media, storage, movie.id);
    } else {
      movie.main.poster = '';
    }

    if (!!movie.promotionalElements.still_photo) {
      for (const stillKey of Object.keys(movie.promotionalElements.still_photo)) {
        const still = movie.promotionalElements.still_photo[stillKey];
        movie.promotionalElements.still_photo[stillKey] = await changeResourceDirectory(still.media, storage, movie.id);
      }
    } else {
      movie.promotionalElements.still_photo = {};
    }

    const keys = ['presentation_deck', 'scenario'];
    // We search for pdf that are not in the good directory
    for (const key of keys) {
      if (!!movie.promotionalElements[key]) {
        const value: PromotionalHostedMedia = movie.promotionalElements[key];
        movie.promotionalElements[key] = await changeResourceDirectory(value.media, storage, movie.id);
      } else {
        movie.promotionalElements[key] = '';
      }
    }

    if (movie.promotionalElements.promo_reel_link?.media) {
      if (movie.promotionalElements.promo_reel_link?.media.url) {
        movie.promotionalElements.promo_reel_link = movie.promotionalElements.promo_reel_link.media.url;
      } else {
        movie.promotionalElements.promo_reel_link = '';
      }
    }

    if (movie.promotionalElements.screener_link?.media) {
      if (movie.promotionalElements.screener_link?.media.url) {
        movie.promotionalElements.screener_link = movie.promotionalElements.screener_link.media.url;
      } else {
        movie.promotionalElements.screener_link = '';
      }
    }

    if (movie.promotionalElements.teaser_link?.media) {
      if (movie.promotionalElements.teaser_link?.media.url) {
        movie.promotionalElements.teaser_link = movie.promotionalElements.teaser_link.media.url;
      } else {
        movie.promotionalElements.teaser_link = '';
      }
    }

    if (movie.promotionalElements.trailer_link?.media) {
      if (movie.promotionalElements.trailer_link?.media.url) {
        movie.promotionalElements.trailer_link = movie.promotionalElements.trailer_link.media.url;
      } else {
        movie.promotionalElements.trailer_link = '';
      }
    }

    if (movie.main.directors?.length) {
      movie.main.directors = movie.main.directors.map(d => {
        d.avatar = '';
        return d;
      });
    }

    if (movie.salesCast?.cast?.length) {
      movie.salesCast.cast = movie.salesCast.cast.map(d => {
        d.avatar = '';
        return d;
      });
    }

    if (movie.salesCast?.crew?.length) {
      movie.salesCast.crew = movie.salesCast.crew.map(d => {
        d.avatar = '';
        return d;
      });
    }

    if (movie.salesCast?.producers?.length) {
      movie.salesCast.producers = movie.salesCast.producers.map(d => {
        d.avatar = '';
        return d;
      });
    }

    const fieldsToReset = [
      'executiveProducer',
      'coProducer',
      'broadcasterCoproducer',
      'lineProducer',
      'distributor',
      'salesAgent',
      'laboratory',
      'financier'
    ];

    fieldsToReset.forEach(f => {
      if (movie.main.stakeholders[f] && movie.main.stakeholders[f].length) {
        movie.main.stakeholders[f] = movie.main.stakeholders[f].map(o => {
          if (o.logo) {
            o.logo = '';
          }
          if (o.avatar) {
            o.avatar = '';
          }
          return o;
        });
      }
    });

    if (movie.festivalPrizes?.prizes.length) {
      movie.festivalPrizes.prizes = movie.festivalPrizes.prizes.map(o => {
        if (o.logo) {
          o.logo = '';
        }
        return o;
      });
    }

    await doc.ref.set(movie);
  });
}

const changeResourceDirectory = async (
  media: HostedMedia,
  storage: Storage,
  docId: string
): Promise<string> => {

  // ### get the old file
  const { url, ref } = media;

  // ### copy it to a new location
  const bucket = storage.bucket(storageBucket);

  try {
    const fileName = url.split('%2F').pop().split('?').shift();

    let newRef = '';
    let oldRef = '';
    if (url.includes(`movie%2F${docId}%2FPresentationDeck`)) {
      oldRef = `movie/${docId}/PresentationDeck/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotional.presentation_deck/${fileName}`;
    } else if (url.includes(`movie%2F${docId}%2FScenario`)) {
      oldRef = `movie/${docId}/Scenario/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotional.scenario/${fileName}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.banner.media`)) {
      oldRef = ref;
      newRef = `movies/${docId}/banner/${ref.split('/').pop()}`;
    } else if (url.includes(`movies%2F${docId}%2FpromotionalElements.presentation_deck.media`)) {
      oldRef = `movies/${docId}/promotionalElements.presentation_deck.media/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotional.presentation_deck/${fileName}`;
    } else if (url.includes(`movies%2F${docId}%2FpromotionalElements.scenario.media`)) {
      oldRef = `movies/${docId}/promotionalElements.scenario.media/${fileName}`; // we don't have ref for pdf medias so we recreate it
      newRef = `movies/${docId}/promotional.scenario/${fileName}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.poster`)) {
      oldRef = ref;
      newRef = `movies/${docId}/poster/${ref.split('/').pop().replace(/(\.|\[)[0-9]{1}\]?\./gi, '')}`;
    } else if (ref.includes(`movies/${docId}/promotionalElements.still_photo`)) {
      oldRef = ref;
      const regex = /(\.|\[)(?<value>[0-9]{1})\]?\./gi;
      const [_, __, index] = regex.exec(ref);
      newRef = `movies/${docId}/promotional.still_photo/${index}/${ref.split('/').pop().replace(/(\.|\[)[0-9]{1}\]?\./gi, '')}`;
    } else if (ref.includes(`users/${docId}/avatar`)) {
      oldRef = ref;
      newRef = `users/${docId}/avatar/${ref.split('/').pop()}`;
    } else if (ref.includes(`orgs/${docId}/logo`)) {
      oldRef = ref;
      newRef = `orgs/${docId}/logo/${ref.split('/').pop()}`;
    }

    if (newRef) {
      const to = bucket.file(newRef);
      const from = bucket.file(oldRef);

      const [exists] = await from.exists();

      if (exists) {
        console.log(`copying ${oldRef} to ${newRef}`);
        await from.copy(to);
        console.log('copy OK');

        // delete previous image
        await from.delete();
        console.log('Removed previous');

        return newRef;
      } else {
        console.log(`Ref ${ref} not found for : ${docId}`);
        return EMPTY_REF;
      }
    } else {
      console.log(`Ref not found for : ${docId}`);
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
async function cleanMovieDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movie/' }))[0];

  let deleted = 0;

  await runChunks(files, async (f) => {
    const movieId = f.name.split('/')[1];
    const movie = await getDocument<any>(`movies/${movieId}`); // @TODO (#3503) remplace any
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!movie && !findImgRefInMovie(movie, f.name) && await f.delete()) { deleted++; }
  });

  return { deleted, total: files.length };
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanMoviesDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'movies/' }))[0];

  let deleted = 0;

  await runChunks(files, async (f) => {
    const movieId = f.name.split('/')[1];
    const movie = await getDocument<any>(`movies/${movieId}`); // @TODO (#3503) remplace any
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!movie && !findImgRefInMovie(movie, f.name) && await f.delete()) { deleted++; }
  });

  return { deleted, total: files.length };
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanUsersDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'users/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    const userId = f.name.split('/')[1];
    const user = await getDocument<any>(`users/${userId}`); // @TODO (#3503) remplace any
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!user && user.avatar !== f.name && user.watermark !== f.name && await f.delete()) { deleted++; }
  });

  return { deleted, total: files.length };
}

/**
 * Deletes everything that is not original
 * and removes files that are not linked in DB
 * @param bucket 
 */
async function cleanOrgsDir(bucket) {
  const files: GFile[] = (await bucket.getFiles({ prefix: 'orgs/' }))[0];
  let deleted = 0;

  await runChunks(files, async (f) => {
    const orgId = f.name.split('/')[1];
    const org = await getDocument<any>(`orgs/${orgId}`); // @TODO (#3503) remplace any
    if (haveImgSize(f) && !isOriginal(f)) {
      if (await f.delete()) { deleted++; }
    } else if (!!org && org.logo !== f.name && await f.delete()) { deleted++; }
  });

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

function findImgRefInMovie(movie: any, ref: string) { // @TODO (#3503) remplace any

  if (movie.main.banner === ref) {
    return true;
  }

  if (movie.main.poster === ref) {
    return true;
  }

  if (Object.values(movie.promotionalElements?.still_photo).some((p: any) => p === ref)) {
    return true;
  }

  if (movie.promotionalElements.scenario === ref) {
    return true;
  };

  if (movie.promotionalElements.presentation_deck === ref) {
    return true;
  };

  return false;
}
