import algoliasearch from 'algoliasearch';
import { algolia } from '../environments/environment';
import pickBy from 'lodash/pickBy';

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
  movie: FirebaseFirestore.DocumentData,
  adminKey?: string
): Promise<any> {
  if (!algolia.adminKey && !adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }
  const ALGOLIA_FIELDS = [
    'movie.main.genres',
    'movie.main.title.international',
    'movie.main.title.original',
    'movie.main.directors',
    'movie.main.language',
    'movie.main.status',
    'movie.main.originCountries',
    'movie.main.length',
    'movie.promotionalDescription.keywords',
    'movie.salesAgentDeal.salesAgent.displayName',
    'movie.versionInfo.dubbings',
    'movie.versionInfo.subtitles'
  ];
  return indexMoviesBuilder(adminKey).saveObject({
    objectId: movie.id,
    movie: pickBy(movie, ALGOLIA_FIELDS)
  });
}
