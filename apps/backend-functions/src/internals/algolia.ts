import algoliasearch from 'algoliasearch';
import { algolia } from '../environments/environment';
import pick from 'lodash/pick';

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
  const ALGOLIA_FIELDS: string[] = [
    'main.genres',
    'main.title.international',
    'main.title.original',
    'main.directors',
    'main.language',
    'main.status',
    'main.originCountries',
    'promotionalDescription.keywords',
    'salesAgentDeal.salesAgent.displayName',
    'versionInfo.dubbings',
    'versionInfo.subtitles'
  ];
  console.log(pickBy(movie, ALGOLIA_FIELDS));
  console.log(movie)
  return indexMoviesBuilder(adminKey).saveObject({
    objectID: movie.id,
    movie: pick(movie, ALGOLIA_FIELDS)
  });
}
