import algoliasearch from 'algoliasearch';
import { algolia as algoliaClient } from '@env';
import * as functions from 'firebase-functions';
import { Language } from '@blockframes/utils/static-model';
import { app, getOrgModuleAccess, modules } from "@blockframes/utils/apps";
import { AlgoliaOrganization, AlgoliaMovie, AlgoliaUser, AlgoliaConfig } from '@blockframes/utils/algolia';
import { OrganizationDocument, orgName } from '@blockframes/organization/+state/organization.firestore';
import { PublicUser } from '@blockframes/user/types';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';
import * as admin from 'firebase-admin';

export const algolia = {
  ...algoliaClient,
  adminKey: functions.config().algolia?.api_key
};

const indexBuilder = (indexName: string, adminKey?: string) => {
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

  const orgRecord: AlgoliaOrganization = {
    objectID: org.id,
    name: orgName(org),
    appModule: getOrgModuleAccess(org),
    country: org.addresses.main.country,
    isAccepted: org.status === 'accepted',
    hasAcceptedMovies: org['hasAcceptedMovies'] ?? false,
    denomination: {
      denomination: org.denomination,
      id: org.id,
      logo: org.logo
    }

  };

  /* If a org doesn't have access to the app dashboard or marketplace, there is no need to create or update the index */
  const orgAppAccess = findOrgAppAccess(org)

  // Update algolia's index
  const promises = orgAppAccess.map(appName => indexBuilder(algolia.indexNameOrganizations[appName], adminKey).saveObject(orgRecord));

  return Promise.all(promises)
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

    const movieRecord: AlgoliaMovie = {
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
        original: !!movie.originalLanguages ? movie.originalLanguages : [],
        dubbed: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang]?.dubbed) as Language[] :
          [],
        subtitle: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang]?.subtitle) as Language[] :
          [],
        caption: !!movie.languages ?
          Object.keys(movie.languages).filter(lang => movie.languages[lang]?.caption) as Language[] :
          [],
      },
      status: !!movie.productionStatus ? movie.productionStatus : '',
      storeConfig: movie.storeConfig?.status || '',
      budget: movie.estimatedBudget || null,
      orgName: organizationName,
      storeType: movie.storeConfig?.storeType || '',
      originalLanguages: movie.originalLanguages,
      runningTime: {
        status: movie.runningTime.status,
        time: movie.runningTime.time
      },
      release: {
        status: movie.release.status,
        year: movie.release.year
      },
      banner: movie.banner.storagePath,
      poster: movie.poster.storagePath
    };

    /* App specific properties */
    if (movie.storeConfig.appAccess.financiers) {
      movieRecord['socialGoals'] = movie?.audience?.goals;
      movieRecord['minPledge'] = movie['minPledge'];
    }

    const movieAppAccess = Object.keys(movie.storeConfig.appAccess).filter(access => movie.storeConfig.appAccess[access]);

    const promises = movieAppAccess.map(appName => indexBuilder(algolia.indexNameMovies[appName], adminKey).saveObject(movieRecord));

    return Promise.all(promises)

  } catch (error) {
    console.error(`\n\n\tFailed to format the movie ${movie.id} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}

// ------------------------------------
//                USERS
// ------------------------------------

export async function storeSearchableUser(user: PublicUser, adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    let orgData;
    if (!!user.orgId) {
      const db = admin.firestore();
      const org = await db.doc(`orgs/${user.orgId}`).get();
      orgData = org.data();
    }

    const userRecord: AlgoliaUser = {
      objectID: user.uid,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      avatar: user.avatar?.storagePath ?? '',
      orgName: orgData ? orgName(orgData) : ''
    };

    return indexBuilder(algolia.indexNameUsers, adminKey).saveObject(userRecord);
  } catch (error) {
    console.error(`\n\n\tFailed to format the user ${user.uid} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}

export function findOrgAppAccess(org: OrganizationDocument) {
  return app.filter(a => modules.some(m => org.appAccess[a]?.[m]));
}
