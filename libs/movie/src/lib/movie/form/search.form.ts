
import { GenresSlug, LanguagesSlug, TerritoriesSlug, MovieStatusSlug, StoreTypeSlug } from '@blockframes/utils/static-model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { StoreStatus } from '../+state/movie.firestore';

// TODO extract that (along with other potential common features) into an algolia file
export interface AlgoliaSearch {
  query: string;
}

export interface LanguagesSearch {
  original: LanguagesSlug[];
  dubbed: LanguagesSlug[];
  subtitle: LanguagesSlug[];
  caption: LanguagesSlug[];
}

export interface MovieSearch extends AlgoliaSearch {
  storeType: StoreTypeSlug[];
  storeConfig: StoreStatus[]
  genres: GenresSlug[];
  originCountries: TerritoriesSlug[];
  languages: LanguagesSearch;
  productionStatus: MovieStatusSlug[];
  minBudget: number;
  sellers: string[];
}

function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {
  return {
    query: '',
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
    ...search,
  };
}

function createLanguageVersionControl(languages: LanguagesSearch) {
  return {
    original: FormList.factory<ExtractSlug<'LANGUAGES'>>(languages.original),
    dubbed: FormList.factory<ExtractSlug<'LANGUAGES'>>(languages.dubbed),
    subtitle: FormList.factory<ExtractSlug<'LANGUAGES'>>(languages.subtitle),
    caption: FormList.factory<ExtractSlug<'LANGUAGES'>>(languages.caption),
  }
}
export type LanguageVersionControl = ReturnType<typeof createLanguageVersionControl>;

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new FormControl(search.query),
    storeType: FormList.factory<ExtractSlug<'STORE_TYPE'>>(search.storeType),
    storeConfig: FormList.factory<StoreStatus>(search.storeConfig),
    genres: FormList.factory<ExtractSlug<'GENRES'>>(search.genres),
    originCountries: FormList.factory<ExtractSlug<'TERRITORIES'>>(search.originCountries),
    languages: new FormEntity<LanguageVersionControl>(createLanguageVersionControl(search.languages)),
    productionStatus: FormList.factory<ExtractSlug<'MOVIE_STATUS'>>(search.productionStatus),
    minBudget: new FormControl(search.minBudget),
    sellers: FormList.factory<string>(search.sellers),
  };
}

export type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

export class MovieSearchForm extends FormEntity<MovieSearchControl> {

  private movieIndex: Index;

  constructor(search: Partial<MovieSearch> = {}) {
    const movieSearch = createMovieSearch(search);
    const control = createMovieSearchControl(movieSearch);
    super(control);

    this.movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameMovies);
  }

  get query() { return this.get('query'); }
  get genres() { return this.get('genres'); }
  get storeType() { return this.get('storeType'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get minBudget() { return this.get('minBudget'); }
  get sellers() { return this.get('sellers'); }
  get storeConfig() { return this.get('storeConfig'); }

  isEmpty() {
    return (
      !this.query.value.trim() &&
      this.storeConfig.value.length === 0 && 
      this.genres.value.length === 0 &&
      this.originCountries.value.length === 0 &&
      this.languages.value.original.length === 0 &&
      this.languages.value.dubbed.length === 0 &&
      this.languages.value.subtitle.length === 0 &&
      this.languages.value.caption.length === 0 &&
      this.productionStatus.value.length === 0 &&
      this.minBudget.value === 0 &&
      this.sellers.value.length === 0 &&
      this.storeType.value.length === 0
    );
  }

  search() {

    return this.movieIndex.search({
      hitsPerPage: 50,
      query: this.query.value,
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
        this.sellers.value.map(seller => `orgName:${seller}`),
        this.storeType.value.map(type => `storeType:${type}`),
        this.storeConfig.value.map(config => `storeConfig:${config}`)
      ],
      filters: `budget >= ${this.minBudget.value}`,
    });
  }
}
