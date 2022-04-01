import {
  loadAdminServices,
  getCollectionInBatches,
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
  getDocument,
} from '@blockframes/firebase-utils';
import { algolia } from '@env';
import { OrganizationDocument, orgName, MovieDocument, PublicUser } from '@blockframes/shared/model';
import { App, getAllAppsExcept } from '@blockframes/utils/apps';
import { Campaign } from '@blockframes/campaign/+state/campaign.model';
import { AlgoliaConfig } from '@blockframes/utils/algolia';

export async function upgradeAlgoliaOrgs(appConfig?: App, db = loadAdminServices().db) {
  if (!appConfig) {
    const promises = getAllAppsExcept(['crm']).map(app => upgradeAlgoliaOrgs(app, db));
    await Promise.all(promises);
  } else {
    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config: AlgoliaConfig = {
      searchableAttributes: ['name'],
      attributesForFaceting: ['appAccess', 'appModule', 'name', 'country', 'isAccepted', 'hasAcceptedMovies'],
      customRanking: ['asc(name)'],
    };
    await clearIndex(algolia.indexNameOrganizations[appConfig], process.env['ALGOLIA_API_KEY']);
    await setIndexConfiguration(algolia.indexNameOrganizations[appConfig], config, process.env['ALGOLIA_API_KEY']);

    const orgsIterator = getCollectionInBatches<OrganizationDocument>(db.collection('orgs'), 'id', 300);
    for await (const orgs of orgsIterator) {
      const promises = orgs.map(org => storeSearchableOrg(org, process.env['ALGOLIA_API_KEY']));

      await Promise.all(promises);
      console.log(`chunk of ${orgs.length} orgs processed...`);
    }

    console.log('Algolia Orgs index updated with success !');
  }
}

export async function upgradeAlgoliaMovies(appConfig?: App, db = loadAdminServices().db) {
  if (!appConfig) {
    const promises = getAllAppsExcept(['crm']).map(app => upgradeAlgoliaMovies(app, db));
    await Promise.all(promises);
  } else {
    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config = movieConfig(appConfig);

    await clearIndex(algolia.indexNameMovies[appConfig], process.env['ALGOLIA_API_KEY']);
    await setIndexConfiguration(algolia.indexNameMovies[appConfig], config, process.env['ALGOLIA_API_KEY']);

    const moviesIterator = getCollectionInBatches<MovieDocument>(db.collection('movies'), 'id', 300);

    for await (const movies of moviesIterator) {
      const promises = movies.map(async movie => {
        try {
          const orgsDocs = await Promise.all(movie.orgIds.map(id => db.doc(`orgs/${id}`).get()));
          const orgs = orgsDocs.map(doc => doc.data() as OrganizationDocument);

          if (!orgs.length) {
            console.error(`Movie ${movie.id} is not part of any orgs`);
          }

          const organizationNames = orgs.map(org => orgName(org));

          if (appConfig === 'financiers') {
            const campaign = await getDocument<Campaign>(`campaign/${movie.id}`);
            if (campaign?.minPledge) {
              movie['minPledge'] = campaign.minPledge;
            }
          }

          await storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
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

export async function upgradeAlgoliaUsers(db = loadAdminServices().db) {
  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config: AlgoliaConfig = {
    searchableAttributes: ['email', 'firstName', 'lastName', 'orgNames'],
    attributesForFaceting: ['email'],
  };

  await clearIndex(algolia.indexNameUsers, process.env['ALGOLIA_API_KEY']);
  await setIndexConfiguration(algolia.indexNameUsers, config, process.env['ALGOLIA_API_KEY']);

  const usersIterator = getCollectionInBatches<PublicUser>(db.collection('users'), 'uid', 300);
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
    console.log(`chunk of ${users.length} users processed...`);
  }
  console.log('Algolia Users index updated with success !');
}

const baseConfig: AlgoliaConfig = {
  searchableAttributes: [
    'title.international',
    'title.original',
    'directors',
    'keywords',
    'originCountries',
    'genres',
    'originalLanguages',
    'orgNames',
    'festivals',
    'productionCompany',
    'salesAgent',
  ],
  attributesForFaceting: [
    // filters
    'filterOnly(budget)',

    // searchable facets
    'searchable(orgNames)',

    // other facets
    'genres',
    'languages.original',
    'languages.dubbed',
    'languages.subtitle',
    'languages.caption',
    'originCountries',
    'status',
    'storeStatus',
    'contentType',
  ],
  customRanking: ['asc(title.international)', 'asc(title.original)'],
};

function movieConfig(appConfig: App): AlgoliaConfig {
  switch (appConfig) {
    case 'financiers':
      return {
        searchableAttributes: baseConfig.searchableAttributes,
        attributesForFaceting: [...baseConfig.attributesForFaceting, 'socialGoals', 'filterOnly(minPledge)'],
      };
    default:
      return baseConfig;
  }
}
