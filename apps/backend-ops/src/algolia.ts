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
    const movieData = movie.data();
    // const user = await db.collection('users').doc(movieData._meta.createdBy).get().then(snap => snap.data());
    // const organization = await db.collection('orgs').doc(user.orgId).get().then(snap => snap.data());
    // promises.push(storeSearchableMovie(movieData, organization.id, organization.name, process.env['ALGOLIA_API_KEY']));

    const promise = db.collection('users').doc(movieData._meta.createdBy).get()
      .then(snap => snap.data())
      .then(user => db.collection('orgs').doc(user.orgId).get())
      .then(snap => snap.data())
      .then(organization => storeSearchableMovie(movieData, organization.id, organization.name, process.env['ALGOLIA_API_KEY']))
    ;
    promises.push(promise);
  });
  return Promise.all(promises);
}
