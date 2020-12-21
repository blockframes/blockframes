
import { GetKeys } from '@blockframes/utils/static-model/static-model';
import { FormControl } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { StoreStatus, ProductionStatus, Territory, Language, Genre, StoreType, SocialGoal } from '@blockframes/utils/static-model/types';
import { App } from "@blockframes/utils/apps";
import { AlgoliaOrganization, AlgoliaSearch } from '@blockframes/utils/algolia';
import { max } from './filters/budget/budget.component';

export interface LanguagesSearch {
  original: Language[];
  dubbed: Language[];
  subtitle: Language[];
  caption: Language[];
}

export interface MovieSearch extends AlgoliaSearch {
  storeType: StoreType[];
  storeConfig: StoreStatus[]
  genres: Genre[];
  originCountries: Territory[];
  languages: LanguagesSearch;
  productionStatus: ProductionStatus[];
  minBudget: number;
  sellers: AlgoliaOrganization[];
  socialGoals: SocialGoal[];
}

export function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {
  return {
    query: '',
    page: 0,
    hitsPerPage: 8,
    storeType: [],
    storeConfig: [],
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
    storeType: FormList.factory<GetKeys<'storeType'>>(search.storeType),
    storeConfig: FormList.factory<StoreStatus>(search.storeConfig),
    genres: FormList.factory<GetKeys<'genres'>>(search.genres),
    originCountries: FormList.factory<Territory>(search.originCountries),
    languages: new FormEntity<LanguageVersionControl>(createLanguageVersionControl(search.languages)),
    productionStatus: FormList.factory<ProductionStatus>(search.productionStatus),
    minBudget: new FormControl(search.minBudget),
    sellers: FormList.factory<AlgoliaOrganization>(search.sellers),
    socialGoals: FormList.factory(search.socialGoals),
  };
}

export type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

export class MovieSearchForm extends FormEntity<MovieSearchControl> {

  private movieIndex: Index;

  constructor(app: App, storeStatus: StoreStatus) {
    const movieSearch = createMovieSearch({});
    const control = createMovieSearchControl(movieSearch);
    super(control);

    this.movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameMovies[app]);
    this.storeConfig.add(storeStatus);
  }

  get query() { return this.get('query'); }
  get page() { return this.get('page'); }
  get genres() { return this.get('genres'); }
  get storeType() { return this.get('storeType'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get minBudget() { return this.get('minBudget'); }
  get sellers() { return this.get('sellers'); }
  get storeConfig() { return this.get('storeConfig'); }
  get socialGoals() { return this.get('socialGoals'); }


  isEmpty() {
    return (
      !this.query.value?.trim() &&
      this.storeConfig.value?.length === 0 &&
      this.genres.value?.length === 0 &&
      this.originCountries.value?.length === 0 &&
      this.languages.value?.original.length === 0 &&
      this.languages.value?.dubbed.length === 0 &&
      this.languages.value?.subtitle.length === 0 &&
      this.languages.value?.caption.length === 0 &&
      this.productionStatus?.value.length === 0 &&
      this.minBudget?.value === 0 &&
      this.sellers?.value.length === 0 &&
      this.storeType?.value.length === 0);
  }

  search() {
    const search = {
      hitsPerPage: 50,
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
        this.storeType.value.map(type => `storeType:${type}`),
        this.storeConfig.value.map(config => `storeConfig:${config}`),
        this.socialGoals.value.map(goal => `socialGoals:${goal}`)
      ],

    } as any;

    if (this.minBudget.value) {
      search.filters = `budget >= ${max - this.minBudget.value ?? 0}`;
    }
    return this.movieIndex.search(search);
  }
}
