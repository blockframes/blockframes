import { db } from '../testing-cypress';
import { storeSearchableOrg, storeSearchableMovie, indexBuilder } from '@blockframes/firebase-utils/algolia';
import algoliasearch from 'algoliasearch';
import { Organization, Movie, App } from '@blockframes/model';
import { algolia } from '@env';
import { capitalize } from '@blockframes/utils/helpers';

export async function storeOrganization(org: Organization) {
  return await storeSearchableOrg(org, process.env['ALGOLIA_API_KEY'], db);
}

export async function storeMovie({ movie, organizationNames }: { movie: Movie; organizationNames: string[] }) {
  return storeSearchableMovie(movie, organizationNames, process.env['ALGOLIA_API_KEY']);
}

export async function clearAlgoliaTestData() {
  //types to adapt if needed further
  const apps: Exclude<App, 'crm' | 'financiers'>[] = ['festival', 'catalog'];
  const indexes: ('organizations' | 'movies')[] = ['organizations', 'movies'];
  for (const app of apps) {
    for (const index of indexes) {
      const searchIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(
        algolia[`indexName${capitalize(index)}`][app]
      );
      const records = await searchIndex.search('', { facetFilters: [`e2eTag:${algolia.e2eTag}`] });
      const objectIDs = records.hits.map(object => object.objectID);
      await indexBuilder(algolia[`indexName${capitalize(index)}`][app], process.env['ALGOLIA_API_KEY']).deleteObjects(objectIDs);
    }
  }
  return 'Algolia cleared !';
}
