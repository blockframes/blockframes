import { loadAdminServices } from './admin';
import {
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
} from '../../backend-functions/src/internals/algolia';
import { MovieDocument, PublicUser } from 'apps/backend-functions/src/data/types';
import { algolia } from '@env';

// TODO MIGRATE TO ALGOLIA v4 #2554

export async function upgradeAlgoliaOrgs() {

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = {};
  await setIndexConfiguration(algolia.indexNameOrganizations, config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameOrganizations, process.env['ALGOLIA_API_KEY']);

  const { db } = loadAdminServices();
  const orgs = await db.collection('orgs').get();

  const promises = [];
  orgs.forEach(org => {
    const { id, denomination } = org.data();
    promises.push(storeSearchableOrg(id, denomination.full, process.env['ALGOLIA_API_KEY']));
  });

  await Promise.all(promises);
  console.log('Algolia Orgs index updated with success !');
}

export async function upgradeAlgoliaMovies() {

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = {
    searchableAttributes: [
      'title.international',
      'title.original',
      'directors',
      'keywords'
    ],
    attributesForFaceting: [
      // filters
      'filterOnly(budget.from)',
      'filterOnly(budget.to)',

      // searchable facets
      'searchable(orgName)',

      // other facets
      'genres',
      'languages.original',
      'languages.dubbed',
      'languages.subtitle',
      'languages.caption',
      'originCountries',
      'status',
    ],
  };
  await setIndexConfiguration(algolia.indexNameMovies, config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameMovies, process.env['ALGOLIA_API_KEY']);

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
        .then(organization => storeSearchableMovie(movieData, organization.denomination.full, process.env['ALGOLIA_API_KEY']))
      ;
      promises.push(promise);
    } catch (error) {
      console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
      console.error(error);
      promises.push(new Promise(res => res(true)));
    }
  });
  await Promise.all(promises);
  console.log('Algolia Movies index updated with success !');
}

export async function upgradeAlgoliaUsers() {

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = {
    searchableAttributes: [
      'email',
      'firstName',
      'lastName',
    ],
  };
  await setIndexConfiguration(algolia.indexNameUsers, config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameUsers, process.env['ALGOLIA_API_KEY']);

  const { db } = loadAdminServices();
  const users = await db.collection('users').get();

  const promises = [];
  users.forEach(user => {
    const userData = user.data() as PublicUser;
    try {

      promises.push(storeSearchableUser(userData, process.env['ALGOLIA_API_KEY']));
    } catch (error) {
      console.error(`\n\n\tFailed to insert a movie ${user.id} : skipping\n\n`);
      console.error(error);
      promises.push(new Promise(res => res(true)));
    }
  });
  await Promise.all(promises);
  console.log('Algolia Users index updated with success !');
}
