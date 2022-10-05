import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie } from '@blockframes/firebase-utils/algolia';
import { Organization, Movie } from '@blockframes/model';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie(data: { movie: Movie; organizationNames: string[] }) {
  const { movie, organizationNames } = data;
  return await storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
}
