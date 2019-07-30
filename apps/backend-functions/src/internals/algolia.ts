import algoliasearch from 'algoliasearch';

import { algoliaAdminKey, algoliaId } from '../environments/environment';

const indexOrganizationsBuilder = () => {
  const client = algoliasearch(algoliaId, algoliaAdminKey);
  const INDEX_NAME_ORGANIZATIONS = 'orgs';
  return client.initIndex(INDEX_NAME_ORGANIZATIONS);
};

export function storeSearchableOrg(orgId: string, name: string): Promise<any> {
  if (algoliaId === "") {
    console.warn("No algolia id set, assuming dev config: skipping")
  }

  return indexOrganizationsBuilder().saveObject({objectID: orgId, name});
}

export function deleteSearchableOrg(orgId: string): Promise<any> {
  if (algoliaId === "") {
    console.warn("No algolia id set, assuming dev config: skipping")
  }

  return indexOrganizationsBuilder().deleteObject(orgId);
}
