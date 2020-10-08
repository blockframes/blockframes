
// Blockframes
import { TerritoriesSlug } from '@blockframes/utils/static-model';
import { FormEntity } from '@blockframes/utils/form';
import { AlgoliaSearch, AlgoliaRecordOrganization } from '@blockframes/ui/algolia/types';
import { createAlgoliaSearch } from '@blockframes/utils/algolia/algolia-search';

// Utils
import algoliasearch, { Index } from 'algoliasearch';
import { algolia } from '@env';

export interface OrganizationSearch extends AlgoliaSearch, Partial<AlgoliaRecordOrganization> {
  country: TerritoriesSlug,
}

export function createOrganizationSearch(search: Partial<OrganizationSearch> = {}): OrganizationSearch {
  return {
    query: '',
    page: 0,
    hitsPerPage: 8,
    country: '',
    ...search,
    appAccess: search.appAccess,
    appModule: search.appModule
  };
}

export class OrganizationSearchForm extends FormEntity<any> {

  private organizationIndex: Index;

  constructor(search: Partial<OrganizationSearch> = {}) {
    super(createAlgoliaSearch<OrganizationSearch, OrganizationSearch>(search, createOrganizationSearch));

    this.organizationIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameOrganizations);
  }

  get query() { return this.get('query'); }
  get page() { return this.get('page'); }
  get country() { return this.get('country'); }
  get appAccess() { return this.get('appAccess') }
  get appModule() { return this.get('appModule') }

  search() {
    return this.organizationIndex.search({
      hitsPerPage: 8,
      query: this.query.value,
      page: this.page.value,
      facetFilters: [
        `country:${this.country.value || ''}`,
        `appAccess:${this.appAccess.value}`,
        `appModule:${this.appModule.value}`
      ]
    });
  }
}
