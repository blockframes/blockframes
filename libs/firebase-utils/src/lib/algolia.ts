import algoliasearch, { IndexSettings } from 'algoliasearch';
import { algolia as algoliaClient, dev } from '@env';
import * as functions from 'firebase-functions';
import { Language } from '@blockframes/utils/static-model';
import { app, getOrgAppAccess, getOrgModuleAccess } from "@blockframes/utils/apps";
import { AlgoliaRecordOrganization, AlgoliaRecordMovie, AlgoliaRecordUser } from '@blockframes/ui/algolia/types';
import { OrganizationDocument, orgName } from '@blockframes/organization/+state/organization.firestore';
import { mockConfigIfNeeded } from './firebase-utils';
import { PublicUser } from '@blockframes/user/types';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';

export const algolia = {
  ...algoliaClient,
  adminKey: dev ? mockConfigIfNeeded('algolia', 'api_key') : functions.config().algolia?.api_key
};

const indexBuilder = (indexName: string, adminKey?: string) => {
  const client = algoliasearch(algolia.appId, adminKey || algolia.adminKey);
  return client.initIndex(indexName);
};

export function deleteObject(indexName: string, objectId: string): Promise<any> {
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

  return indexBuilder(indexName, adminKey).clearIndex()
}

export function setIndexConfiguration(indexName: string, config: IndexSettings, adminKey?: string) {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexBuilder(indexName, adminKey).setSettings(config);
}
// ------------------------------------
//           ORGANIZATIONS
// ------------------------------------

export function storeSearchableOrg(org: OrganizationDocument, adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  const orgRecord: AlgoliaRecordOrganization = {
    objectID: org.id,
    name: orgName(org),
    appAccess: getOrgAppAccess(org),
    appModule: getOrgModuleAccess(org),
    country: org.addresses.main.country
  };

  return indexBuilder(algolia.indexNameOrganizations, adminKey).saveObject(orgRecord);
}

// ------------------------------------
//               MOVIES
// ------------------------------------

export function storeSearchableMovie(
  movie: MovieDocument,
  organizationName: string,
  adminKey?: string
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    const movieAppAccess = movie.storeConfig.appAccess;

    const movieRecord: AlgoliaRecordMovie = {
      objectID: movie.id,

      // searchable keys
      title: {
        international: movie.title.international || '',
        original: movie.title.original,
      },
      directors: !!movie.directors ?
        movie.directors.map((director) => `${director.firstName} ${director.lastName}`) :
        [],
      keywords: !!movie.keywords ? movie.keywords : [],

      // facets
      genres: !!movie.genres ? movie.genres : [],
      originCountries: !!movie.originCountries ? movie.originCountries : [],
      languages: {
        original: !!movie.originalLanguages ? movie.originalLanguages: [],
        dubbed: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang as Language]?.dubbed) :
          [],
        subtitle: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang as Language]?.subtitle) :
          [],
        caption: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang as Language]?.caption) :
          [],
      },
      status: !!movie.productionStatus ? movie.productionStatus : '',
      storeConfig: movie.storeConfig?.status || '',
      budget: movie.estimatedBudget?.from || 0,
      orgName: organizationName,
      storeType: movie.storeConfig?.storeType || '',
      appAccess: movieAppAccess ?
        app.filter(a => movie.storeConfig?.appAccess[a]) :
        [],
    };

    return indexBuilder(algolia.indexNameMovies, adminKey).saveObject(movieRecord);
  } catch (error) {
    console.error(`\n\n\tFailed to format the movie ${movie.id} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}

// ------------------------------------
//                USERS
// ------------------------------------

export function storeSearchableUser(user: PublicUser, adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    const userRecord: AlgoliaRecordUser = {
      objectID: user.uid,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      avatar: user.avatar ?? '',
    };

    return indexBuilder(algolia.indexNameUsers, adminKey).saveObject(userRecord);
  } catch (error) {
    console.error(`\n\n\tFailed to format the user ${user.uid} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}
