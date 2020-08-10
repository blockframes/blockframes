import { Firestore } from '../admin';
import { startMaintenance, endMaintenance } from 'apps/backend-functions/src/maintenance';
import { runChunks } from '../tools';

import {
  OldHostedMedia as HostedMedia,
  createOldHostedMedia as createHostedMedia,
} from './old-types';

const EMPTY_REF: HostedMedia = { ref: '', url: '' };

export async function upgrade(db: Firestore) {
  await startMaintenance();

  console.log('//////////////');
  console.log('// [DB] Processing Users');
  console.log('//////////////');
  await db
    .collection('users')
    .get()
    .then(async users => await updateUsers(users));

  console.log('Updated users.');

  console.log('//////////////');
  console.log('// [DB] Processing Orgs');
  console.log('//////////////');
  await db
    .collection('orgs')
    .get()
    .then(async orgs => await updateOrgs(orgs));

  console.log('Updated orgs.');

  console.log('//////////////');
  console.log('// [DB] Processing movies');
  console.log('//////////////');
  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies));

  console.log('Updated movies.');

  await endMaintenance();
}

/**
 * @param users
 */
async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(users.docs, async (doc) => {
    const user = doc.data() as any;

    if (user.avatar?.original?.ref) {
      const avatar = user.avatar?.original;
      user.avatar = createHostedMedia({ ref: avatar.ref, url: avatar.url });
    } else {
      user.avatar = EMPTY_REF;
    }
    await doc.ref.set(user);
  });

}

/**
 * @param orgs
 */
async function updateOrgs(
  orgs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as any;

    if (org.logo?.original?.ref) {
      const logo = org.logo?.original;
      org.logo = createHostedMedia({ ref: logo.ref, url: logo.url });
    } else {
      org.logo = EMPTY_REF;
    }
    await doc.ref.set(org);
  });
}

/**
 * @param movies
 */
async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as any;

    if (movie.main.banner?.media?.original?.ref) {
      const banner = movie.main.banner.media.original;
      movie.main.banner.media = createHostedMedia({ ref: banner.ref, url: banner.url });
    } else {
      movie.main.banner.media = EMPTY_REF;
    }

    if (movie.main.poster?.media?.original?.ref) {
      const poster = movie.main.poster.media.original;
      movie.main.poster.media = createHostedMedia({ ref: poster.ref, url: poster.url });
    } else {
      movie.main.poster = EMPTY_REF;
    }

    if (!!movie.promotionalElements.still_photo) {
      for (const stillKey of Object.keys(movie.promotionalElements.still_photo)) {
        if(movie.promotionalElements.still_photo[stillKey].media?.original?.ref){
          const still = movie.promotionalElements.still_photo[stillKey].media.original;
          movie.promotionalElements.still_photo[stillKey].media = createHostedMedia({ ref: still.ref, url: still.url });
        } else {
          delete movie.promotionalElements.still_photo[stillKey];
        }
      }
    } else {
      movie.promotionalElements.still_photo = {};
    }

    await doc.ref.set(movie);
  });
}


