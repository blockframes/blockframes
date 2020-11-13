import {
  loadAdminServices,
  getCollectionInBatches,
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
  getDocument,
  hasAcceptedMovies
} from '@blockframes/firebase-utils';
import { algolia } from '@env';
import { OrganizationDocument, orgName } from "@blockframes/organization/+state/organization.firestore";
import { MovieDocument } from "@blockframes/movie/+state/movie.firestore";
import { PublicUser } from "@blockframes/user/types";
import { App, app } from '@blockframes/utils/apps';
import { Campaign } from '@blockframes/campaign/+state/campaign.model';

// TODO MIGRATE TO ALGOLIA v4 #2554

export async function upgradeAlgoliaOrgs(appConfig?: App) {
  if (!appConfig) {
    const promises = app.map(upgradeAlgoliaOrgs);
    await Promise.all(promises);
  } else {

    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config = {
      searchableAttributes: ['name'],
      attributesForFaceting: [
        'appAccess',
        'appModule',
        'name',
        'country',
        'isAccepted',
        'hasAcceptedMovies'
      ],
    };
    await setIndexConfiguration(algolia.indexNameOrganizations[appConfig], config, process.env['ALGOLIA_API_KEY']);
    await clearIndex(algolia.indexNameOrganizations[appConfig], process.env['ALGOLIA_API_KEY']);

    const { db } = loadAdminServices();
    const orgsIterator = getCollectionInBatches<OrganizationDocument>(db.collection('orgs'), 'id', 300)
    for await (const orgs of orgsIterator) {

      for (const org of orgs) {
        if (await hasAcceptedMovies(org)) {
          org['hasAcceptedMovies'] = true;
        }
      }

      const promises = orgs.map(org => storeSearchableOrg(org, process.env['ALGOLIA_API_KEY']));

      await Promise.all(promises);
      console.log(`chunk of ${orgs.length} orgs processed...`);
    }

    console.log('Algolia Orgs index updated with success !');
  }
}

export async function upgradeAlgoliaMovies(appConfig?: App) {

  if (!appConfig) {
    const promises = app.map(upgradeAlgoliaMovies);
    await Promise.all(promises);
  } else {

    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config = movieConfig(appConfig)

    await setIndexConfiguration(algolia.indexNameMovies[appConfig], config, process.env['ALGOLIA_API_KEY']);
    await clearIndex(algolia.indexNameMovies[appConfig], process.env['ALGOLIA_API_KEY']);

    const { db } = loadAdminServices();
    const moviesIterator = getCollectionInBatches<MovieDocument>(db.collection('movies'), 'id', 300);

    for await (const movies of moviesIterator) {
      const promises = movies.map(async movie => {
        try {

          const orgsDocs = await Promise.all(movie.orgIds.map(id => db.doc(`orgs/${id}`).get()))

          const orgs = orgsDocs.map(doc => doc.data() as OrganizationDocument)

          if (!orgs.length) {
            console.error(`Movie ${movie.id} is not part of any orgs`);
          }

          // TODO : here we might decide to arbitrary choose first org
          /*    if (querySnap.size > 1) {
               throw new Error(`Movie ${movie.id} is part of several orgs (${querySnap.docs.map(doc => doc.id).join(', ')})`);
             } */

          const org = orgs[0];
          const organizationName = orgName(org);

          if (appConfig === 'financiers') {
            const campaign = await getDocument<Campaign>(`campaign/${movie.id}`);
            if (campaign?.minPledge) {
              movie['minPledge'] = campaign.minPledge;
            }
            if (campaign?.minPledge) {
              movie['minPledge'] = campaign.minPledge;
            }
          }

          await storeSearchableMovie(movie, organizationName, process.env['ALGOLIA_API_KEY'])
        } catch (error) {
          console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
          console.error(error);
        }
      });

      await Promise.all(promises);
      console.log(`chunk of ${movies.length} movies processed...`);
    }

    console.log('Algolia Movies index updated with success !');
  }
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

const baseConfig = {
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
  ]
};

function movieConfig(appConfig: App) {
  switch (appConfig) {
    case 'financiers': return {
      searchableAttributes: baseConfig.searchableAttributes,
      attributesForFaceting: [
        ...baseConfig.attributesForFaceting,
        'socialGoals',
        'filterOnly(minPledge)'
      ]
    }
    default: return baseConfig;
  }
}
