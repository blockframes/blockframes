// Blockframes
import { Territory } from '@blockframes/utils/static-model';
import { FormEntity } from '@blockframes/utils/form';
import { AlgoliaSearch, AlgoliaOrganization } from '@blockframes/utils/algolia';
import { Organization } from '../+state';
import { App } from '@blockframes/utils/apps';

// Utils
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { algolia } from '@env';
import { FormControl } from '@angular/forms';

export interface OrganizationSearch extends AlgoliaSearch, Partial<AlgoliaOrganization> {
  country?: Territory,
}

export function createOrganizationSearch(search: Partial<OrganizationSearch> = {}): OrganizationSearch {
  return {
    query: '',
    page: 0,
    hitsPerPage: 25,
    isAccepted: true,
    hasAcceptedMovies: true,
    ...search,
    appModule: search.appModule
  };
}

function createOrganizationSearchControl(search: OrganizationSearch) {
  return {
    query: new FormControl(search.query),
    page: new FormControl(search.page),
    hitsPerPage: new FormControl(search.hitsPerPage),
    country: new FormControl(search.country),
    appModule: new FormControl(search.appModule),
    isAccepted: new FormControl(search.isAccepted),
    hasAcceptedMovies: new FormControl(search.hasAcceptedMovies)
  };
}

export type OrganizationSearchControl = ReturnType<typeof createOrganizationSearchControl>;

export class OrganizationSearchForm extends FormEntity<OrganizationSearchControl> {

  private organizationIndex: SearchIndex;

  constructor(app: App, search: Partial<OrganizationSearch> = {}) {
    const organizationSearch = createOrganizationSearch(search);
    const control = createOrganizationSearchControl(organizationSearch);
    super(control);
    this.organizationIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameOrganizations[app]);
  }

  get query() { return this.get('query'); }
  get page() { return this.get('page'); }
  get hitsPerPage() { return this.get('hitsPerPage') }
  get country() { return this.get('country'); }
  get appModule() { return this.get('appModule') }
  get isAccepted() { return this.get('isAccepted') }
  get hasAcceptedMovies() { return this.get('hasAcceptedMovies') }


  search() {
    return this.organizationIndex.search<Organization>(this.query.value, {
      hitsPerPage: this.hitsPerPage.value,
      page: this.page.value,
      facetFilters: [
        `country:${this.country.value || ''}`,
        `appModule:${this.appModule.value}`,
        `isAccepted:${this.isAccepted.value}`,
        `hasAcceptedMovies:${this.hasAcceptedMovies.value}`
      ]
    });
  }
}
