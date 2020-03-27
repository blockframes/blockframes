import { loadAdminServices } from './admin';
import {
  setMovieConfiguration,
  storeSearchableMovie,
  storeSearchableOrg
} from '../../backend-functions/src/internals/algolia';
import { MovieDocument } from 'apps/backend-functions/src/data/types';

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

  // ensure the index is correctly configured before inserting records
  await setMovieConfiguration(process.env['ALGOLIA_API_KEY']);

  const { db } = loadAdminServices();
  const movies = await db.collection('movies').get();

  const promises = [];
  movies.forEach(movie => {
    const movieData = movie.data() as MovieDocument;
    try {

      const promise = db.collection('users').doc(movieData._meta.createdBy).get()
        .then(snap => snap.data())
        .then(user => db.collection('orgs').doc(user.orgId).get())
        .then(snap => snap.data())
        .then(organization => storeSearchableMovie(movieData, organization.name, process.env['ALGOLIA_API_KEY']))
      ;
      promises.push(promise);
    } catch (error) {
      console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
      console.error(error);
      promises.push(new Promise(res => res(true)));
    }
  });
  return Promise.all(promises);
}
