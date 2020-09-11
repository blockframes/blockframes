import { loadAdminServices, getCollectionInBatches } from "@blockframes/firebase-utils";
import {
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
} from '../../backend-functions/src/internals/algolia';  // TODO (#3471) remove this call to backend-functions
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
  const orgsIterator = getCollectionInBatches<OrganizationDocument>(db.collection('orgs'), 'id', 300)
  for await (const orgs of orgsIterator) {
    const promises = orgs.map(org => {
      return storeSearchableOrg(org, process.env['ALGOLIA_API_KEY']);
    });

    await Promise.all(promises);
    console.log(`chunk of ${orgs.length} orgs processed...`)
  }

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
  const moviesIterator = getCollectionInBatches<MovieDocument>(db.collection('movies'), 'id', 300)

  for await (const movies of moviesIterator) {
    const promises = movies.map(async movie => {
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

        await storeSearchableMovie(movie, orgName, process.env['ALGOLIA_API_KEY'])
      } catch (error) {
        console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
        console.error(error);
      }
    });
    await Promise.all(promises);
    console.log(`chunk of ${movies.length} movies processed...`)
  }

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
  const usersIterator = getCollectionInBatches<PublicUser>(db.collection('users'), 'uid', 300)
  for await (const users of usersIterator) {
    const promises = users.map(async user => {
      try {
        await storeSearchableUser(user, process.env['ALGOLIA_API_KEY']);
      } catch (error) {
        console.error(`\n\n\tFailed to insert a user ${user.uid} : skipping\n\n`);
        console.error(error);
      }
    });
    await Promise.all(promises);
    console.log(`chunk of ${users.length} users processed...`)
  }
  console.log('Algolia Users index updated with success !');
}
