import algoliasearch, { IndexSettings } from 'algoliasearch';
import { algolia } from '../environments/environment';
import { MovieDocument, PublicUser } from '../data/types';
import { LanguagesSlug } from '@blockframes/utils/static-model';

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

export function storeSearchableOrg(orgId: string, name: string, adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexBuilder(algolia.indexNameOrganizations, adminKey).saveObject({ objectID: orgId, name });
}

// ------------------------------------
//               MOVIES
// ------------------------------------

export function storeSearchableMovie(
  movie: MovieDocument,
  orgName: string,
  adminKey?: string
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  try {
    return indexBuilder(algolia.indexNameMovies, adminKey).saveObject({
      objectID: movie.id,

      // searchable keys
      title: {
        international: movie.main.title.international,
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
        original: !! movie.main.originalLanguages ? movie.main.originalLanguages: [],
        dubbed: !! movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.dubbed) :
          [],
        subtitle: !! movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.subtitle) :
          [],
        caption: !! movie.versionInfo.languages ?
          Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.caption) :
          [],
      },
      status: !! movie.main.status ? movie.main.status : '',
      budget: movie.budget.totalBudget ||  movie.budget.estimatedBudget?.from || 0,
      orgName,
      storeType: movie.main.storeConfig?.storeType || '',
    });
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
    return indexBuilder(algolia.indexNameUsers, adminKey).saveObject({
      objectID: user.uid,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '',
    });
  } catch (error) {
    console.error(`\n\n\tFailed to format the movie ${user.uid} into an algolia record : skipping\n\n`);
    console.error(error);
    return new Promise(res => res(true));
  }
}
