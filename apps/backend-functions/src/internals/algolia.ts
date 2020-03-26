import algoliasearch from 'algoliasearch';
import { algolia } from '../environments/environment';
import { MovieDocument } from '../data/types';
import { LanguagesSlug } from '@blockframes/utils/static-model';

const indexOrganizationsBuilder = (adminKey?: string) => {
  const client = algoliasearch(algolia.appId, adminKey || algolia.adminKey);
  const INDEX_NAME_ORGANIZATIONS = algolia.indexNameOrganizations;
  return client.initIndex(INDEX_NAME_ORGANIZATIONS);
};

export function storeSearchableOrg(orgId: string, name: string, adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexOrganizationsBuilder(adminKey).saveObject({ objectID: orgId, name });
}

export function deleteSearchableOrg(orgId: string): Promise<any> {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexOrganizationsBuilder().deleteObject(orgId);
}

const indexMoviesBuilder = (adminKey?: string) => {
  const client = algoliasearch(algolia.appId, adminKey || algolia.adminKey);
  const INDEX_NAME_MOVIES = algolia.indexNameMovies;
  return client.initIndex(INDEX_NAME_MOVIES);
};

export function setMovieConfiguration(adminKey?: string): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexMoviesBuilder(adminKey).setSettings({
    searchableAttributes: [
      'title.international',
      'title.original',
      'directors',
      'keywords'
    ],
    attributesForFaceting: [
      // filters
      'filterOnly(budget.from)',
      'filterOnly(budget.to)',

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
    ],
  });
}

export function storeSearchableMovie(
  movie: MovieDocument,
  orgName: string,
  adminKey?: string
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexMoviesBuilder(adminKey).saveObject({
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
    genres: movie.main.genres,
    originCountries: movie.main.originCountries,
    languages: {
      original: movie.main.originalLanguages,
      dubbed: Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.dubbed),
      subtitle: Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.subtitle),
      caption: Object.keys(movie.versionInfo.languages).filter(lang => movie.versionInfo.languages[lang as LanguagesSlug]?.caption),
    },
    status: movie.main.status,
    budget: {
      from: movie.budget.estimatedBudget!.from,
      to: movie.budget.estimatedBudget!.to,
    },
    orgName,
  });
}

export function deleteSearchableMovie(movieId: string): Promise<any> {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexMoviesBuilder().deleteObject(movieId);
}
