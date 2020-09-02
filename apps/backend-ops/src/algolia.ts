import { loadAdminServices } from "@blockframes/firebase-utils";
import {
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
} from '../../backend-functions/src/internals/algolia';  // @TODO (#3471) remove this call to backend-functions
import { MovieDocument, PublicUser, OrganizationDocument } from 'apps/backend-functions/src/data/types';  // @TODO (#3471) remove this call to backend-functions
import { algolia } from '@env';

// TODO MIGRATE TO ALGOLIA v4 #2554

export async function upgradeAlgoliaOrgs() {

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = {
    searchableAttributes: [ 'name' ],
    attributesForFaceting: [
      'appAccess',
      'appModule',
    ],
  };
  await setIndexConfiguration(algolia.indexNameOrganizations, config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameOrganizations, process.env['ALGOLIA_API_KEY']);

  const { db } = loadAdminServices();
  const orgs = await db.collection('orgs').get();

  const promises = orgs.docs.map(async doc => {
    const org = doc.data() as OrganizationDocument;
    return storeSearchableOrg(org, process.env['ALGOLIA_API_KEY']);
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
      'filterOnly(budget)',

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
      'storeConfig',
      'storeType',
      'appAccess',
    ],
  };
  await setIndexConfiguration(algolia.indexNameMovies, config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameMovies, process.env['ALGOLIA_API_KEY']);

  const { db } = loadAdminServices();
  const movies = await db.collection('movies').get();

  const promises = movies.docs.map(async movie => {
    const movieData = movie.data() as MovieDocument;

    try {

      // TODO issue#2692
      const querySnap = await db.collection('orgs').where('movieIds', 'array-contains', movie.id).get();

      if (querySnap.size === 0) {
        throw new Error(`Movie ${movie.id} is not part of any orgs`);
      }

      // TODO : here we might decide to arbitrary choose first org
      if (querySnap.size > 1) {
        throw new Error(`Movie ${movie.id} is part of several orgs (${querySnap.docs.map(doc => doc.id).join(', ')})`);
      }

      const org = (querySnap.docs[0].data() as OrganizationDocument);
      const orgName = org.denomination.public || org.denomination.full;

      await storeSearchableMovie(movieData, orgName, process.env['ALGOLIA_API_KEY'])
    } catch (error) {
      console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
      console.error(error);
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

  const promises = users.docs.map(async user => {
    const userData = user.data() as PublicUser;
    try {
      await storeSearchableUser(userData, process.env['ALGOLIA_API_KEY']);
    } catch (error) {
      console.error(`\n\n\tFailed to insert a movie ${user.id} : skipping\n\n`);
      console.error(error);
    }
  });
  await Promise.all(promises);
  console.log('Algolia Users index updated with success !');
}
