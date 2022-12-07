import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie, clearAlgoliaTestData as _clearAlgoliaTestData } from '@blockframes/firebase-utils/algolia';
import { Organization, Movie, AlgoliaApp } from '@blockframes/model';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie({ movie, organizationNames }: { movie: Movie; organizationNames: string[] }) {
  return storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
}

export async function clearAlgoliaTestData(apps: AlgoliaApp[]) {
  return _clearAlgoliaTestData(apps);
}
