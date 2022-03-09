// Blockframes
import { Territory } from '@blockframes/utils/static-model';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { AlgoliaSearch } from '@blockframes/utils/algolia';
import { Organization } from '@blockframes/model';
import { App, Module } from '@blockframes/utils/apps';

// Utils
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { algolia } from '@env';
import { FormControl } from '@angular/forms';

export interface OrganizationSearch extends AlgoliaSearch {
  appModule: Module[],
  isAccepted: boolean,
  hasAcceptedMovies: boolean,
  countries?: Territory[],
}

export function createOrganizationSearch(search: Partial<OrganizationSearch> = {}): OrganizationSearch {
  return {
    appModule: [],
    countries: [],
    query: '',
    page: 0,
    hitsPerPage: 25,
    isAccepted: true,
    hasAcceptedMovies: true,
    ...search
    };
}

function createOrganizationSearchControl(search: OrganizationSearch) {
  return {
    query: new FormControl(search.query),
    page: new FormControl(search.page),
    hitsPerPage: new FormControl(search.hitsPerPage),
    countries: FormList.factory<Territory>(search.countries),
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
  get countries() { return this.get('countries'); }
  get appModule() { return this.get('appModule') }
  get isAccepted() { return this.get('isAccepted') }
  get hasAcceptedMovies() { return this.get('hasAcceptedMovies') }


  search() {
    return this.organizationIndex.search<Organization>(this.query.value, {
      hitsPerPage: this.hitsPerPage.value,
      page: this.page.value,
      facetFilters: [
        this.countries.value.map(country => `country:${country}`),
        [`appModule:${this.appModule.value}`],
        [`isAccepted:${this.isAccepted.value}`],
        [`hasAcceptedMovies:${this.hasAcceptedMovies.value}`]
      ]
    });
  }
}
