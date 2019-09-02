import algoliasearch from 'algoliasearch';

import { algolia } from '../environments/environment';

const indexOrganizationsBuilder = () => {
  const client = algoliasearch(algolia.appId, algolia.adminKey);
  const INDEX_NAME_ORGANIZATIONS = algolia.indexNameOrganizations;
  return client.initIndex(INDEX_NAME_ORGANIZATIONS);
};

export function storeSearchableOrg(orgId: string, name: string): Promise<any> {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexOrganizationsBuilder().saveObject({ objectID: orgId, name });
}

export function deleteSearchableOrg(orgId: string): Promise<any> {
  if (!algolia.adminKey) {
    console.warn('No algolia id set, assuming dev config: skipping');
    return Promise.resolve(true);
  }

  return indexOrganizationsBuilder().deleteObject(orgId);
}
