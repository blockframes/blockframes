import {
  loadAdminServices,
  getCollectionInBatches,
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
} from '@blockframes/firebase-utils';

import { algolia } from '@env';
import { OrganizationDocument } from "@blockframes/organization/+state/organization.firestore";
import { MovieDocument } from "@blockframes/movie/+state/movie.firestore";
import { PublicUser } from "@blockframes/user/types";
import { App, app } from '@blockframes/utils/apps';
import { Campaign } from '@blockframes/campaign/+state/campaign.model';

// TODO MIGRATE TO ALGOLIA v4 #2554

export async function upgradeAlgoliaOrgs() {

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = {
    searchableAttributes: ['name'],
    attributesForFaceting: [
      'appAccess',
      'appModule',
      'name',
      'country'
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

export async function upgradeAlgoliaMovies(appConfig?: App) {

  if (!appConfig) {
    app.forEach(async a => await upgradeAlgoliaMovies(a))
    return;
  }

  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config = movieConfig(appConfig)

  await setIndexConfiguration(algolia.indexNameMovies[appConfig], config, process.env['ALGOLIA_API_KEY']);
  await clearIndex(algolia.indexNameMovies[appConfig], process.env['ALGOLIA_API_KEY']);

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

        if (appConfig === 'financiers') {
          const campaignSnap = await db.collection('campaigns').where('id', '==', movie.id).get();
          const campaign = (campaignSnap.docs[0].data() as Campaign);
          if (campaign?.id) {
            
          }
        }

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
    attributesForFaceting: [
      'email'
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

function movieConfig(appConfig: App) {
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
      'storeType'
    ],
  };
  switch (appConfig) {
    case 'financiers': {
      config.attributesForFaceting.push('audience.goals')
    }
  }
  return config;
}
