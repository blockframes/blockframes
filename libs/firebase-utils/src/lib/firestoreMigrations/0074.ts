import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Organization, Movie } from '@blockframes/model';

/**
 * Remove isBlockchainEnabled from org documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  await migrateMovie(db);
  return await migrateOrg(db);
}

async function migrateMovie(db: Firestore) {
  const movies = await db.collection('movies').get();

  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as Movie;

    // Check if movie has a crew with mini 1 member
    if (!movie.crew?.length) return false;

    // Replace all bad 'confiremd' with the fix one
    movie.crew = movie.crew.map((crew) => {
      // If status == confiremd
      if (crew.status as any === 'confiremd') {
        return {
          ...crew,
          status: 'confirmed'
        };
      }
      return crew;
    })

    // Update movie in DB
    await doc.ref.set(movie);
  }).catch(err => console.error(err));
}

async function migrateOrg(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as Organization;

    delete (org as any).isBlockchainEnabled;

    await doc.ref.set(org);
  }).catch(err => console.error(err));
}
