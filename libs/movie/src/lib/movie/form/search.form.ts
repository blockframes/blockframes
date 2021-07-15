
import { GetKeys } from '@blockframes/utils/static-model/static-model';
import { FormControl, Validators } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { SearchIndex } from 'algoliasearch';
import { StoreStatus, ProductionStatus, Territory, Language, Genre, SocialGoal, ContentType } from '@blockframes/utils/static-model/types';
import { App } from "@blockframes/utils/apps";
import { AlgoliaOrganization, AlgoliaSearch } from '@blockframes/utils/algolia';
import { max } from './filters/budget/budget.component';
import { Movie } from '../+state';

export interface LanguagesSearch {
  original: Language[];
  dubbed: Language[];
  subtitle: Language[];
  caption: Language[];
}

export interface MovieSearch extends AlgoliaSearch {
  storeStatus: StoreStatus[];
  genres: Genre[];
  originCountries: Territory[];
  languages: LanguagesSearch;
  productionStatus: ProductionStatus[];
  minBudget: number;
  release?: number;
  sellers: AlgoliaOrganization[];
  socialGoals: SocialGoal[];
  contentType?: ContentType;
}

export function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {

  return {
    query: '',
    page: 0,
    hitsPerPage: 50,
    storeStatus: [],
    genres: [],
    originCountries: [],
    languages: {
      original: [],
      dubbed: [],
      subtitle: [],
      caption: [],
    },
    productionStatus: [],
    minBudget: 0,
    sellers: [],
    socialGoals: [],
    ...search,
  };
}

function createLanguageVersionControl(languages: LanguagesSearch) {
  return {
    original: FormList.factory<GetKeys<'languages'>>(languages.original),
    dubbed: FormList.factory<GetKeys<'languages'>>(languages.dubbed),
    subtitle: FormList.factory<GetKeys<'languages'>>(languages.subtitle),
    caption: FormList.factory<GetKeys<'languages'>>(languages.caption),
  }
}
export type LanguageVersionControl = ReturnType<typeof createLanguageVersionControl>;

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new FormControl(search.query),
    page: new FormControl(search.page),
    storeStatus: FormList.factory<StoreStatus>(search.storeStatus),
    genres: FormList.factory<GetKeys<'genres'>>(search.genres),
    originCountries: FormList.factory<Territory>(search.originCountries),
    languages: new FormEntity<LanguageVersionControl>(createLanguageVersionControl(search.languages)),
    productionStatus: FormList.factory<ProductionStatus>(search.productionStatus),
    minBudget: new FormControl(search.minBudget),
    release: new FormControl(search.release),
    sellers: FormList.factory<AlgoliaOrganization>(search.sellers),
    socialGoals: FormList.factory(search.socialGoals),
    contentType: new FormControl(search.contentType),
    // Max is 1000, see docs: https://www.algolia.com/doc/api-reference/api-parameters/hitsPerPage/
    hitsPerPage: new FormControl(50, Validators.max(1000))
  };
}

export type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

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
  get release() { return this.get('release'); }
  get sellers() { return this.get('sellers'); }
  get storeStatus() { return this.get('storeStatus'); }
  get socialGoals() { return this.get('socialGoals'); }
  get hitsPerPage() { return this.get('hitsPerPage'); }
  get contentType() { return this.get('contentType'); }

  isEmpty() {
    return (
      !this.query.value?.trim() &&
      this.storeStatus.value?.length === 0 &&
      this.genres.value?.length === 0 &&
      this.originCountries.value?.length === 0 &&
      this.languages.value?.original.length === 0 &&
      this.languages.value?.dubbed.length === 0 &&
      this.languages.value?.subtitle.length === 0 &&
      this.languages.value?.caption.length === 0 &&
      this.productionStatus?.value.length === 0 &&
      this.minBudget?.value === 0 &&
      !this.release.value &&
      this.sellers?.value.length === 0 &&
      !this.contentType.value);
  }

  search() {
    const search = {
      hitsPerPage: this.hitsPerPage.value,
      query: this.query.value,
      page: this.page.value,
      facetFilters: [
        this.genres.value.map(genre => `genres:${genre}`), // same facet inside an array means OR for algolia
        this.originCountries.value.map(country => `originCountries:${country}`),
        [
          ...this.languages.get('original').controls.map(lang => `languages.original:${lang.value}`),
          ...this.languages.get('dubbed').controls.map(lang => `languages.dubbed:${lang.value}`),
          ...this.languages.get('subtitle').controls.map(lang => `languages.subtitle:${lang.value}`),
          ...this.languages.get('caption').controls.map(lang => `languages.caption:${lang.value}`),
        ],
        this.productionStatus.value.map(status => `status:${status}`),
        this.sellers.value.map(seller => `orgName:${seller.name}`),
        this.storeStatus.value.map(config => `storeStatus:${config}`),
        this.socialGoals.value.map(goal => `socialGoals:${goal}`),
        [`contentType:${this.contentType.value || ''}`]
      ],

    };

    if (this.minBudget.value) {
      search['filters'] = `budget >= ${max - this.minBudget.value ?? 0}`;
    }
    if (this.release.value) {
      search['filters'] = `release.year <= ${this.release.value}`;
    }

    return this.movieIndex.search<Movie>(search.query, search);
  }
}
