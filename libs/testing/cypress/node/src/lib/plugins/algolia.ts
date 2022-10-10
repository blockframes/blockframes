import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie, indexBuilder } from '@blockframes/firebase-utils/algolia';
import { Organization, Movie } from '@blockframes/model';
import { algolia } from 'env/env';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie(data: { movie: Movie; organizationNames: string[] }) {
  const { movie, organizationNames } = data;
  return await storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
}

export async function algoliaDelete(docId: string) {
  return await indexBuilder(algolia.indexNameMovies.catalog, process.env['ALGOLIA_API_KEY']).deleteObject(docId);
}
