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

export function storeSearchableMovie(
  movie: MovieDocument,
  orgName: string,
  adminKey?: string
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  // TODO un-nest the data
  // const ALGOLIA_FIELDS: string[] = [
    // 'main.genres',
    // 'main.title.international',
    // 'main.title.original',
    // 'main.directors', // TODO clean useless fields in this array
    // 'main.originalLanguages',
    // 'main.status',
    // 'main.originCountries',
    // 'promotionalDescription.keywords',
    // 'salesAgentDeal.salesAgent.displayName',
    // 'versionInfo.dubbings', // TODO implement correctly the languages
    // 'versionInfo.subtitles', // TODO implement correctly the languages
    // 'budget.estimatedBudget.from',
    // 'budget.estimatedBudget.to'
  // ];
  return indexMoviesBuilder(adminKey).saveObject({
    objectID: movie.id,
    // movie: pick(movie, ALGOLIA_FIELDS),

    // searchable keys
    title: {
      international: movie.main.title.international,
      original: movie.main.title.original,
    },
    directors: movie.main.directors!.map((director) => `${director.firstName} ${director.lastName}`),
    keywords: movie.promotionalDescription.keywords,

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

    // orgId,
  });
}

export function deleteSearchableMovie(movieId: string): Promise<any> {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexMoviesBuilder().deleteObject(movieId);
}
