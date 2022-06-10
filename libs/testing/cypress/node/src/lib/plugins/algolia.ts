import { db } from '../testing-cypress';
import { storeSearchableOrg } from '@blockframes/firebase-utils/algolia';
import { OrganizationDocument } from '@blockframes/model';

export async function storeOrganization(org: OrganizationDocument) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}