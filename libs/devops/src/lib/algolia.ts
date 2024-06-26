import {
  getCollectionInBatches,
  clearIndex,
  setIndexConfiguration,
  storeSearchableMovie,
  storeSearchableOrg,
  storeSearchableUser,
  getDocument,
  indexExists,
} from '@blockframes/firebase-utils';
import { algolia } from '@env';
import {
  PublicUser,
  Campaign,
  AlgoliaConfig,
  App,
  getAllAppsExcept,
  Organization,
  Movie
} from '@blockframes/model';
import { getDb } from '@blockframes/firebase-utils/initialize';

type AlgoliaApp = Exclude<App, 'crm'>;

export async function upgradeAlgoliaOrgs(appConfig?: AlgoliaApp, db = getDb()) {
  if (!appConfig) {
    const promises = (<AlgoliaApp[]>getAllAppsExcept(['crm'])).map((app) => upgradeAlgoliaOrgs(app, db));
    await Promise.all(promises);
  } else {
    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config: AlgoliaConfig = {
      searchableAttributes: ['name'],
      attributesForFaceting: [
        'appAccess',
        'appModule',
        'name',
        'country',
        'isAccepted',
        'hasAcceptedMovies',
      ],
      customRanking: ['asc(name)'],
      paginationLimitedTo: 1000,
      typoTolerance: true,
    };
    await clearIndex(algolia.indexNameOrganizations[appConfig], process.env['ALGOLIA_API_KEY']);
    await setIndexConfiguration(
      algolia.indexNameOrganizations[appConfig],
      config,
      process.env['ALGOLIA_API_KEY']
    );

    const orgsIterator = getCollectionInBatches<Organization>(
      db.collection('orgs'),
      'id',
      300
    );
    for await (const orgs of orgsIterator) {
      const promises = orgs.map((org) => storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db, appConfig));

      await Promise.all(promises);
      console.log(`chunk of ${orgs.length} orgs processed...`);
    }

    console.log(`Algolia Orgs ${algolia.indexNameOrganizations[appConfig]} index updated with success !`);
  }
}

export async function upgradeAlgoliaMovies(appConfig?: App, db = getDb()) {
  if (!appConfig) {
    const promises = getAllAppsExcept(['crm']).map((app) => upgradeAlgoliaMovies(app, db));
    await Promise.all(promises);
  } else {
    // reset config, clear index and fill it up from the db (which is the only source of truth)
    const config = movieConfig(appConfig);

    if (!indexExists('indexNameMovies', appConfig)) return;

    await clearIndex(algolia.indexNameMovies[appConfig], process.env['ALGOLIA_API_KEY']);
    await setIndexConfiguration(
      algolia.indexNameMovies[appConfig],
      config,
      process.env['ALGOLIA_API_KEY']
    );

    const moviesIterator = getCollectionInBatches<Movie>(
      db.collection('movies'),
      'id',
      300
    );

    for await (const movies of moviesIterator) {
      const promises = movies.map(async (movie) => {
        try {
          const orgs = await Promise.all(movie.orgIds.map((id) => getDocument<Organization>(`orgs/${id}`, db)));

          if (!orgs.length) {
            console.error(`Movie ${movie.id} is not part of any orgs`);
          }

          if (appConfig === 'financiers') {
            const campaign = await getDocument<Campaign>(`campaign/${movie.id}`, db);
            if (campaign?.minPledge) {
              movie['minPledge'] = campaign.minPledge;
            }
          }

          await storeSearchableMovie(movie, orgs, process.env['ALGOLIA_API_KEY'], appConfig);
        } catch (error) {
          console.error(`\n\n\tFailed to insert a movie ${movie.id} : skipping\n\n`);
          console.error(error);
        }
      });

      await Promise.all(promises);
      console.log(`chunk of ${movies.length} movies processed...`);
    }

    console.log(`Algolia Movies ${algolia.indexNameMovies[appConfig]} index updated with success !`);
  }
}

export async function upgradeAlgoliaUsers(db = getDb()) {
  // reset config, clear index and fill it up from the db (which is the only source of truth)
  const config: AlgoliaConfig = {
    searchableAttributes: ['email', 'firstName', 'lastName', 'orgNames'],
    attributesForFaceting: ['email'],
    paginationLimitedTo: 1000,
    typoTolerance: true,
  };

  await clearIndex(algolia.indexNameUsers, process.env['ALGOLIA_API_KEY']);
  await setIndexConfiguration(algolia.indexNameUsers, config, process.env['ALGOLIA_API_KEY']);

  const usersIterator = getCollectionInBatches<PublicUser>(db.collection('users'), 'uid', 300);
  for await (const users of usersIterator) {
    const promises = users.map(async (user) => {
      try {
        await storeSearchableUser(user, process.env['ALGOLIA_API_KEY'], db);
      } catch (error) {
        console.error(`\n\n\tFailed to insert a user ${user.uid} : skipping\n\n`);
        console.error(error);
      }
    });
    await Promise.all(promises);
    console.log(`chunk of ${users.length} users processed...`);
  }
  console.log(`Algolia Users ${algolia.indexNameUsers} index updated with success !`);
}

const baseConfig: AlgoliaConfig = {
  searchableAttributes: [
    'title.international',
    'title.original',
    'directors',
    'keywords',
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
    'festivals',
    'certifications',
    'orgIds'
  ],
  customRanking: ['asc(title.international)', 'asc(title.original)'],
  paginationLimitedTo: 2000,
  typoTolerance: false,
};

function movieConfig(appConfig: App): AlgoliaConfig {
  switch (appConfig) {
    case 'financiers':
      return {
        searchableAttributes: baseConfig.searchableAttributes,
        attributesForFaceting: [
          ...baseConfig.attributesForFaceting,
          'socialGoals',
          'filterOnly(minPledge)',
        ],
        paginationLimitedTo: baseConfig.paginationLimitedTo,
        typoTolerance: baseConfig.typoTolerance,
      };
    default:
      return baseConfig;
  }
}
