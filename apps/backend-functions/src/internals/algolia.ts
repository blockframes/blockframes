import algoliasearch, { IndexSettings } from 'algoliasearch';
import { algolia } from '../environments/environment';
import { MovieDocument, PublicUser, OrganizationDocument } from '../data/types';
import { LanguagesSlug } from '@blockframes/utils/static-model';
import { app, getOrgAppAccess, getOrgModuleAccess } from "@blockframes/utils/apps";
import { AlgoliaRecordOrganization, AlgoliaRecordMovie, AlgoliaRecordUser } from '@blockframes/ui/algolia/types';
import { orgName } from '@blockframes/organization/+state/organization.firestore';

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
    const movieAppAccess = movie.main.storeConfig!.appAccess;

    const movieRecord: AlgoliaRecordMovie = {
      objectID: movie.id,

      // searchable keys
      title: {
        international: movie.main.title.international || '',
        original: movie.main.title.original,
      },
      directors: !!movie.main.directors ?
        movie.main.directors.map((director) => `${director.firstName} ${director.lastName}`) :
        [],
      keywords: movie.promotionalDescription.keywords,

      // facets
      genres: !!movie.main.genres ? movie.main.genres : [],
      originCountries: !!movie.main.originCountries ? movie.main.originCountries : [],
      languages: {
        original: !!movie.main.originalLanguages ? movie.main.originalLanguages: [],
        dubbed: !!movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.dubbed) :
          [],
        subtitle: !!movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.subtitle) :
          [],
        caption: !!movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.caption) :
          [],
      },
      status: !!movie.main.status ? movie.main.status : '',
      storeConfig: movie.main.storeConfig?.status || '',
      budget: movie.budget.totalBudget?.amount || movie.budget.estimatedBudget?.from || 0,
      orgName: organizationName,
      storeType: movie.main.storeConfig?.storeType || '',
      appAccess: movieAppAccess ?
        app.filter(a => movie.main.storeConfig?.appAccess[a]) :
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
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '',
    };

    return indexBuilder(algolia.indexNameUsers, adminKey).saveObject(userRecord);
  } catch (error) {
    console.error(`\n\n\tFailed to format the user ${user.uid} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}
