import { GetKeys, AlgoliaMovie, AlgoliaOrganization, App, festival, recursiveSearch, AlgoliaSearchQuery, MovieSearch, LanguageVersion, Versions } from '@blockframes/model';
import type { StoreStatus, Territory, AlgoliaRunningTime } from '@blockframes/model';
import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity, FormList, FormStaticValueArray } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { max } from './filters/budget/budget.component';
import { maxQueryLength } from '@blockframes/utils/algolia';


export function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {

  return {
    query: '',
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
    minReleaseYear: 0,
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
      original: new FormControl(data.versions.original),
      dubbed: new FormControl(data.versions.dubbed),
      subtitle: new FormControl(data.versions.subtitle),
      caption: new FormControl(data.versions.caption),
    })
  })
}

export type LanguageVersionControl = ReturnType<typeof createLanguageVersionControl>;

function createRunningTimeControl(data: AlgoliaRunningTime) {
  return {
    min: new FormControl(data.min),
    max: new FormControl(data.max),
  };
}

export type RunningTimeControl = ReturnType<typeof createRunningTimeControl>;

export class RunningTimeForm extends FormEntity<RunningTimeControl> {
  constructor(data?: AlgoliaRunningTime) {
    super(createRunningTimeControl(data));
  }
}

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new FormControl(search.query),
    page: new FormControl(search.page),
    storeStatus: FormList.factory<StoreStatus>(search.storeStatus),
    genres: FormList.factory<GetKeys<'genres'>>(search.genres),
    originCountries: FormList.factory<Territory>(search.originCountries),
    languages: createLanguageVersionControl(search.languages),
    productionStatus: new FormStaticValueArray<'productionStatus'>(search.productionStatus, 'productionStatus'),
    minBudget: new FormControl(search.minBudget),
    minReleaseYear: new FormControl(search.minReleaseYear),
    sellers: FormList.factory<AlgoliaOrganization>(search.sellers),
    socialGoals: new FormStaticValueArray<'socialGoals'>(search.socialGoals, 'socialGoals'),
    contentType: new FormControl(search.contentType),
    runningTime: new RunningTimeForm(search.runningTime),
    // Max is 1000, see docs: https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
    hitsPerPage: new FormControl(50, Validators.max(1000)),
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
  get page() { return this.get('page'); }
  get genres() { return this.get('genres'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get minBudget() { return this.get('minBudget'); }
  get minReleaseYear() { return this.get('minReleaseYear'); }
  get sellers() { return this.get('sellers'); }
  get storeStatus() { return this.get('storeStatus'); }
  get socialGoals() { return this.get('socialGoals'); }
  get hitsPerPage() { return this.get('hitsPerPage'); }
  get contentType() { return this.get('contentType'); }
  get runningTime() { return this.get('runningTime'); }
  get festivals() { return this.get('festivals'); }
  get certifications() { return this.get('certifications'); }

  search(needMultipleQueries = false, override?: { hitsPerPage: number, page: number }) {
    const search = this.prepareSearch(needMultipleQueries, override);
    return this.movieIndex.search<AlgoliaMovie>(search.query, search);
  }

  recursiveSearch() {
    const search = this.prepareSearch();
    return recursiveSearch<AlgoliaMovie>(this.movieIndex, search);
  }

  private prepareSearch(needMultipleQueries = false, override?: { hitsPerPage: number, page: number }) {
    const search: AlgoliaSearchQuery = {
      hitsPerPage: this.hitsPerPage.value,
      query: maxQueryLength(this.query.value),
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
    if (this.minReleaseYear.value) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `release.year >= ${this.minReleaseYear.value}`;
    }
    if (this.runningTime.value.min) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `runningTime.time >= ${this.runningTime.value.min}`;
    }
    if (this.runningTime.value.max) {
      if (search.filters) search.filters += ' AND ';
      search.filters += `runningTime.time <= ${this.runningTime.value.max}`;
    }

    /*
    Allow the user to use comma or space to separate their research.
    ex : `France, Berlinale, Action` can be a research but without the `optionalWords`
    it will be considered as one string/research and not 3 differents.
    */
    if (needMultipleQueries) {
      const multipleQueries: string[] = this.query.value.split(',' || ' ');
      search['optionalWords'] = maxQueryLength(multipleQueries);
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
