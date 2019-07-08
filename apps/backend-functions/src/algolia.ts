import algoliasearch from 'algoliasearch';

import { algoliaAdminKey, algoliaId } from './environments/environment';

const client = algoliasearch(algoliaId, algoliaAdminKey);
const INDEX_NAME_ORGANIZATIONS = 'orgs';

const indexOrganizationsBuilder = () => client.initIndex(INDEX_NAME_ORGANIZATIONS);

export function storeSearchableOrg(orgId: string, name: string): Promise<any> {
  return indexOrganizationsBuilder().saveObject({objectID: orgId, name});
}

export function deleteSearchableOrg(orgId: string): Promise<any> {
  return indexOrganizationsBuilder().deleteObject(orgId);
}
