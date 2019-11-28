import algoliasearch from 'algoliasearch';

import { algolia } from '../environments/environment';

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
  return indexMoviesBuilder(adminKey).saveObject({
    objectID: movie.id,
    movie: {
      main: {
        genres: movie.main.genres,
        title: {
          international: movie.main.title.international
        },
        directors: movie.main.directors,
        languages: movie.main.language,
        status: movie.main.status,
        originCountries: movie.main.originCountries,
        length: movie.main.length
      },
      promotionalDescription: {
        keywords: movie.promotionalDescription.keywords
      },
      salesAgentDeal: { salesAgent: { displayName: movie.salesAgentDeal.salesAgent.displayName } },
      versionInfo: {
        dubbings: movie.versionInfo.dubbings,
        subtitles: movie.versionInfo.subtitles
      }
    }
  });
}
