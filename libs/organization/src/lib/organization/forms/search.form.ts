
// Angular
import { FormControl } from '@angular/forms';

// Blockframes
import { TerritoriesSlug } from '@blockframes/utils/static-model';
import { FormEntity } from '@blockframes/utils/form';
import { AlgoliaSearch, AlgoliaRecordOrganization } from '@blockframes/ui/algolia/types';

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
    country: '',
    ...search,
    appAccess: search.appAccess,
    appModule: search.appModule
  };
}

function createOrganizationSearchControl(search: OrganizationSearch) {
  return {
    query: new FormControl(search.query),
    page: new FormControl(search.page),
    country: new FormControl(search.country),
  };
}

export type OrganizationSearchControl = ReturnType<typeof createOrganizationSearch>;

export class OrganizationSearchForm extends FormEntity<OrganizationSearchControl> {

  private organizationIndex: Index;

  constructor(search: Partial<OrganizationSearch> = {}) {
    const organizationSearch = createOrganizationSearch(search);
    const control = createOrganizationSearchControl(organizationSearch);
    super(control);

    this.organizationIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameOrganizations);
  }

  get query() { return this.get('query'); }
  get page() { return this.get('page'); }
  get country() { return this.get('country'); }


  isEmpty() {
    return !this.query.value?.trim();
  }

  search() {
    return this.organizationIndex.search({
      hitsPerPage: 8,
      query: this.query.value,
      page: this.page.value,
      facetFilters: [
        `country:${this.country.value}`
      ]
    });
  }
}
