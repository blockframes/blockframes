import { db } from '../testing-cypress';
import { storeSearchableOrg } from '@blockframes/firebase-utils/algolia';
import { Organization } from '@blockframes/model';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}