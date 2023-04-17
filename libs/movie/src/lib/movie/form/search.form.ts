import { GetKeys, AlgoliaMovie, AlgoliaOrganization, App, festival, recursiveSearch, AlgoliaSearchQuery, MovieSearch, LanguageVersion, Versions } from '@blockframes/model';
import type { StoreStatus, AlgoliaMinMax } from '@blockframes/model';
import { UntypedFormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity, FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { max } from './filters/budget/budget.component';
import { maxQueryLength } from '@blockframes/utils/algolia';


export function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {

  return {
    query: '',
    searchBy: [],
    page: 0,
    hitsPerPage: 50,
    storeStatus: [],
    genres: [],
    originCountries: [],
    languages: {
      languages: [],
      versions: {
        original: false,
        dubbed: false,
        subtitle: false,
        caption: false,
      },
    },
    productionStatus: [],
    minBudget: 0,
    releaseYear: { min: null, max: null },
    sellers: [],
    socialGoals: [],
    runningTime: { min: null, max: null },
    festivals: [],
    certifications: [],
    ...search,
  };
}

function createLanguageVersionControl(data: LanguageVersion) {
  return new FormEntity<EntityControl<LanguageVersion>, LanguageVersion>({
    languages: FormList.factory<GetKeys<'languages'>>(data.languages),
    versions: new FormEntity<EntityControl<Versions>, Versions>({
      original: new UntypedFormControl(data.versions.original),
      dubbed: new UntypedFormControl(data.versions.dubbed),
      subtitle: new UntypedFormControl(data.versions.subtitle),
      caption: new UntypedFormControl(data.versions.caption),
    })
  })
}

export type LanguageVersionControl = ReturnType<typeof createLanguageVersionControl>;

function createMinMaxControl(data: AlgoliaMinMax) {
  return {
    min: new UntypedFormControl(data.min),
    max: new UntypedFormControl(data.max),
  };
}

type minMaxControl = ReturnType<typeof createMinMaxControl>;

export class minMaxForm extends FormEntity<minMaxControl> {
  constructor(data?: AlgoliaMinMax) {
    super(createMinMaxControl(data));
  }
}

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new UntypedFormControl(search.query),
    searchBy: new UntypedFormControl(search.searchBy),
    page: new UntypedFormControl(search.page),
    storeStatus: FormList.factory<StoreStatus>(search.storeStatus),
    genres: FormList.factory<GetKeys<'genres'>>(search.genres),
    originCountries: new FormStaticValueArray<'territories'>(search.originCountries, 'territories'),
    languages: createLanguageVersionControl(search.languages),
    productionStatus: new FormStaticValueArray<'productionStatus'>(search.productionStatus, 'productionStatus'),
    minBudget: new UntypedFormControl(search.minBudget),
    releaseYear: new minMaxForm(search.releaseYear),
    sellers: FormList.factory<AlgoliaOrganization>(search.sellers),
    socialGoals: new FormStaticValueArray<'socialGoals'>(search.socialGoals, 'socialGoals'),
    contentType: new UntypedFormControl(search.contentType),
    runningTime: new minMaxForm(search.runningTime),
    // Max is 1000, see docs: https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
    hitsPerPage: new UntypedFormControl(50, Validators.max(1000)),
    festivals: new FormStaticValueArray<'festival'>(search.festivals, 'festival'),
    certifications: new FormStaticValueArray<'certifications'>(search.certifications, 'certifications')
  };
}

type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

export class MovieSearchForm extends FormEntity<MovieSearchControl> {

  private movieIndex: SearchIndex;

  constructor(app: App, storeStatus: StoreStatus) {
    const movieSearch = createMovieSearch({});
    const control = createMovieSearchControl(movieSearch);
    super(control);

    this.movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameMovies[app]);
    this.storeStatus.add(storeStatus);
  }

  get query() { return this.get('query'); }
  get searchBy() { return this.get('searchBy')}
  get page() { return this.get('page'); }
  get genres() { return this.get('genres'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get minBudget() { return this.get('minBudget'); }
  get releaseYear() { return this.get('releaseYear'); }
  get sellers() { return this.get('sellers'); }
  get storeStatus() { return this.get('storeStatus'); }
  get socialGoals() { return this.get('socialGoals'); }
  get hitsPerPage() { return this.get('hitsPerPage'); }
  get contentType() { return this.get('contentType'); }
  get runningTime() { return this.get('runningTime'); }
  get festivals() { return this.get('festivals'); }
  get certifications() { return this.get('certifications'); }

  search(override?: { hitsPerPage: number, page: number }) {
    const search = this.prepareSearch(override);
    return this.movieIndex.search<AlgoliaMovie>(search.query, search);
  }

  recursiveSearch() {
    const search = this.prepareSearch();
    return recursiveSearch<AlgoliaMovie>(this.movieIndex, search);
  }

  private prepareSearch(override?: { hitsPerPage: number, page: number }) {
    const search: AlgoliaSearchQuery = {
      hitsPerPage: this.hitsPerPage.value,
      query: maxQueryLength(this.query.value),
      restrictSearchableAttributes: this.searchBy.value,
      page: this.page.value,
      facetFilters: [
        this.genres.value.map(genre => `genres:${genre}`), // same facet inside an array means OR for algolia
        this.originCountries.value.map(country => `originCountries:${country}`),
        this.getLanguages(this.languages.value),
        this.productionStatus.value.map(status => `status:${status}`),
        this.sellers.value.map(seller => `orgNames:${seller.name}`),
        this.storeStatus.value.map(config => `storeStatus:${config}`),
        this.socialGoals.value.map(goal => `socialGoals:${goal}`),
        this.festivals.value.map(festivalName => `festivals:${festival[festivalName]}`),
        this.certifications.value.map(certification => `certifications:${certification}`),
        [`contentType:${this.contentType.value || ''}`]
      ],
      filters: '',
      ...override
    };

    if (this.minBudget.value) {
      search.filters = `budget >= ${max - this.minBudget.value ?? 0}`;
    }
    if (this.releaseYear.value.min) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `release.year >= ${this.releaseYear.value.min}`;
    }
    if (this.releaseYear.value.max) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `release.year <= ${this.releaseYear.value.max}`;
    }
    if (this.runningTime.value.min) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `runningTime.time >= ${this.runningTime.value.min}`;
    }
    if (this.runningTime.value.max) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `runningTime.time <= ${this.runningTime.value.max}`;
    }

    return search;
  }

  getLanguages(data: LanguageVersion) {
    const versions: string[] = [];
    if (data.versions?.original) versions.push('original');
    if (data.versions?.dubbed) versions.push('dubbed');
    if (data.versions?.subtitle) versions.push('subtitle');
    if (data.versions?.caption) versions.push('caption');
    return versions.flatMap(v => data.languages.map(l => `languages.${v}:${l}`))
  }

}
