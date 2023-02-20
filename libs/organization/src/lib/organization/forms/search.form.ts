// Blockframes
import { FormEntity, FormList } from '@blockframes/utils/form';
import { Organization, Territory, App, OrganizationSearch, AlgoliaModule } from '@blockframes/model';

// Utils
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { algolia } from '@env';
import { FormControl } from '@angular/forms';
import { maxQueryLength } from '@blockframes/utils/algolia/helper.utils';

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
    const appModule: string[] = this.appModule.value.map((module: AlgoliaModule) => `appModule:${module}`);
    return this.organizationIndex.search<Organization>(maxQueryLength(this.query.value), {
      hitsPerPage: this.hitsPerPage.value,
      page: this.page.value,
      facetFilters: [
        this.countries.value.map(country => `country:${country}`),
        ...appModule,
        [`isAccepted:${this.isAccepted.value}`],
        [`hasAcceptedMovies:${this.hasAcceptedMovies.value}`]
      ]
    });
  }
}
