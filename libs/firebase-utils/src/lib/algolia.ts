import algoliasearch from 'algoliasearch';
import { algolia as algoliaClient, centralOrgId } from '@env';
import * as functions from 'firebase-functions';
import {
  PublicUser,
  festival,
  Language,
  AlgoliaOrganization,
  AlgoliaMovie,
  AlgoliaUser,
  AlgoliaConfig,
  getOrgModuleAccess,
  getMovieAppAccess,
  getOrgAppAccess,
  Movie,
  Organization,
  App
} from '@blockframes/model';
import { hasAcceptedMovies } from './util';
import { getDb } from './initialize';

export const algolia = {
  ...algoliaClient,
  adminKey: functions.config().algolia?.api_key,
};

type AlgoliaIndexGroup = keyof Omit<typeof algoliaClient, 'appId'>;
export const indexExists = (indexGroup: AlgoliaIndexGroup, app: App) => {
  return !!algolia[indexGroup][app];
}

export const indexBuilder = (indexName: string, adminKey?: string) => {
  const client = algoliasearch(algolia.appId, adminKey || algolia.adminKey);
  return client.initIndex(indexName);
};

export function deleteObject(indexName: string, objectId: string) {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexBuilder(indexName).deleteObject(objectId);
}

export function clearIndex(indexName: string, adminKey?: string) {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexBuilder(indexName, adminKey).delete();
}

export function setIndexConfiguration(indexName: string, config: AlgoliaConfig, adminKey?: string) {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexBuilder(indexName, adminKey).setSettings({
    attributesForFaceting: config.attributesForFaceting,
    searchableAttributes: config.searchableAttributes,
    customRanking: config.customRanking,
    paginationLimitedTo: config.paginationLimitedTo,
    typoTolerance: config.typoTolerance,
  });
}

// ------------------------------------
//           ORGANIZATIONS
// ------------------------------------

export function storeSearchableOrg(
  org: Organization,
  adminKey?: string,
  db = getDb(),
  app?: App
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  if (Object.values(centralOrgId).includes(org.id)) return;

  /* If a org doesn't have access to the app dashboard or marketplace, there is no need to create or update the index */
  const orgAppAccess = app ? getOrgAppAccess(org).filter(a => a === app) : getOrgAppAccess(org);

  // Update algolia's index
  const promises = orgAppAccess.map(async (appName) => {
    org['hasAcceptedMovies'] = await hasAcceptedMovies(org, appName, db);
    const orgRecord = createAlgoliaOrganization(org);
    if (orgRecord.name) {
      return indexBuilder(algolia.indexNameOrganizations[appName], adminKey).saveObject(orgRecord);
    }
  });
  return Promise.all(promises);
}

export function createAlgoliaOrganization(org: Organization): AlgoliaOrganization {
  return {
    objectID: org.id,
    name: org.name,
    appModule: getOrgModuleAccess(org),
    country: org.addresses.main.country,
    isAccepted: org.status === 'accepted',
    hasAcceptedMovies: org['hasAcceptedMovies'] ?? false,
    logo: org.logo.storagePath,
    activity: org.activity,
  };
}

// ------------------------------------
//               MOVIES
// ------------------------------------

export function storeSearchableMovie(
  movie: Movie,
  organizations: Organization[],
  adminKey?: string,
  app?: App
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    const organizationNames = organizations.map(org => org.name).filter(orgName => !!orgName);
    const orgIds = organizations.map(org => org.id).filter(orgId => !!orgId);
    const movieRecord: AlgoliaMovie = {
      objectID: movie.id,

      // searchable keys
      title: {
        international: movie.title.international || '',
        original: movie.title.original,
      },
      directors: movie.directors
        ? movie.directors.map((director) => `${director.firstName} ${director.lastName}`)
        : [],
      keywords: movie.keywords ? movie.keywords : [],
      // Register the entire festival name because it will be used for research by users
      festivals: movie.prizes.map((prize) => festival[prize.name]) || [],
      productionCompany:
        movie.stakeholders.productionCompany.map((company) => company.displayName) || [],
      salesAgent: movie.stakeholders.salesAgent.map((agent) => agent.displayName) || [],

      // facets
      genres: movie.genres ? movie.genres : [],
      originCountries: movie.originCountries ? movie.originCountries : [],
      languages: {
        original: movie.originalLanguages ? movie.originalLanguages : [],
        dubbed: movie.languages
          ? (Object.keys(movie.languages).filter(
            (lang) => movie.languages[lang]?.dubbed
          ) as Language[])
          : [],
        subtitle: movie.languages
          ? (Object.keys(movie.languages).filter(
            (lang) => movie.languages[lang]?.subtitle
          ) as Language[])
          : [],
        caption: movie.languages
          ? (Object.keys(movie.languages).filter(
            (lang) => movie.languages[lang]?.caption
          ) as Language[])
          : [],
      },
      status: movie.productionStatus ? movie.productionStatus : '',
      storeStatus: '',
      budget: movie.estimatedBudget || null,
      orgNames: organizationNames,
      orgIds,
      originalLanguages: movie.originalLanguages,
      runningTime: {
        status: movie.runningTime.status,
        time: movie.runningTime.time,
        episodeCount: movie.runningTime.episodeCount
      },
      release: {
        status: movie.release.status,
        year: movie.release.year,
      },
      banner: movie.banner.storagePath,
      poster: movie.poster.storagePath,
      contentType: movie.contentType,
      certifications: movie.certifications
    };

    /* App specific properties */
    if (movie.app.financiers.access) {
      movieRecord['socialGoals'] = movie?.audience?.goals;
      movieRecord['minPledge'] = movie['minPledge'];
    }

    const movieAppAccess = app ? getMovieAppAccess(movie).filter(a => a === app) : getMovieAppAccess(movie);

    const promises = movieAppAccess
      .filter(appName => indexExists('indexNameMovies', appName))
      .map(appName =>
        indexBuilder(algolia.indexNameMovies[appName], adminKey).saveObject({
          ...movieRecord,
          storeStatus: movie.app[appName]?.status || '',
        })
      );

    return Promise.all(promises);
  } catch (error) {
    console.error(
      `\n\n\tFailed to format the movie ${movie.id} into an algolia record : skipping\n\n`
    );
    console.error(error);
    return new Promise((res) => res(true));
  }
}

// ------------------------------------
//                USERS
// ------------------------------------

export async function storeSearchableUser(user: PublicUser, adminKey?: string, db = getDb()): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    let orgData;
    if (user.orgId) {
      const org = await db.doc(`orgs/${user.orgId}`).get();
      orgData = org.data();
    }

    const userRecord: AlgoliaUser = {
      objectID: user.uid,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      avatar: user.avatar?.storagePath ?? '',
      orgName: orgData ? orgData.name : '',
    };

    return indexBuilder(algolia.indexNameUsers, adminKey).saveObject(userRecord);
  } catch (error) {
    console.error(
      `\n\n\tFailed to format the user ${user.uid} into an algolia record : skipping\n\n`
    );
    console.error(error);
    return new Promise((res) => res(true));
  }
}
