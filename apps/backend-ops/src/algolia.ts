import { loadAdminServices } from './admin';
import {
  storeSearchableMovie,
  storeSearchableOrg
} from '../../backend-functions/src/internals/algolia';

export async function upgradeAlgoliaOrgs() {
  const { db } = loadAdminServices();
  const orgs = await db.collection('orgs').get();

  const promises = [];
  orgs.forEach(org => {
    const { id, name } = org.data();
    promises.push(storeSearchableOrg(id, name, process.env['ALGOLIA_API_KEY']));
  });

  return Promise.all(promises);
}

export async function upgradeAlgoliaMovies() {
  const { db } = loadAdminServices();
  const movies = await db.collection('movies').get();

  const promises = [];
  movies.forEach(movie => {
    promises.push(storeSearchableMovie(movie.data(), process.env['ALGOLIA_API_KEY']));
  });
  return Promise.all(promises);
}
