
import { GenresSlug, LanguagesSlug, TerritoriesSlug, MovieStatusSlug, StoreTypeSlug } from '@blockframes/utils/static-model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';

// TODO extract that (along with other potential common features) into an algolia file
export interface AlgoliaSearch {
  query: string;
}

export interface MovieSearch extends AlgoliaSearch {
  storeType: StoreTypeSlug[];
  genres: GenresSlug[];
  originCountries: TerritoriesSlug[];
  languages: {
    original: LanguagesSlug[],
    dubbed: LanguagesSlug[],
    subtitle: LanguagesSlug[],
    caption: LanguagesSlug[],
  };
  productionStatus: MovieStatusSlug[];
  minBudget: number;
  sellers: string[];
}

function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {
  return {
    query: '',
    storeType: [],
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

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new FormControl(search.query),
    storeType: FormList.factory<ExtractSlug<'STORE_TYPE'>>(search.storeType),
    genres: FormList.factory<ExtractSlug<'GENRES'>>(search.genres),
    originCountries: FormList.factory<ExtractSlug<'TERRITORIES'>>(search.originCountries),
    languages: new FormGroup({
      original: new FormList<ExtractSlug<'LANGUAGES'>>(search.languages.original),
      dubbed: new FormList<ExtractSlug<'LANGUAGES'>>(search.languages.dubbed),
      subtitle: new FormList<ExtractSlug<'LANGUAGES'>>(search.languages.subtitle),
      caption: new FormList<ExtractSlug<'LANGUAGES'>>(search.languages.caption),

    }),
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

  isEmpty() {
    return (
      !this.query.value.trim() &&
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
      query: this.query.value,
      facetFilters: [
        [...this.genres.value.map(genre => `genres:${genre}`)], // same facet inside an array means OR for algolia
        [...this.originCountries.value.map(country => `originCountries:${country}`)],
        [
          ...(this.languages.get('original') as FormList<ExtractSlug<'LANGUAGES'>>).controls.map(lang => `languages.original:${lang.value}`),
          ...(this.languages.get('dubbed') as FormList<ExtractSlug<'LANGUAGES'>>).controls.map(lang => `languages.dubbed:${lang.value}`),
          ...(this.languages.get('subtitle') as FormList<ExtractSlug<'LANGUAGES'>>).controls.map(lang => `languages.subtitle:${lang.value}`),
          ...(this.languages.get('caption') as FormList<ExtractSlug<'LANGUAGES'>>).controls.map(lang => `languages.caption:${lang.value}`),
        ],
        [...this.productionStatus.value.map(status => `status:${status}`)],
        [...this.sellers.value.map(seller => `orgName:${seller}`)],
        [...this.storeType.value.map(type => `storeType:${type}`)],
      ],
      filters: `budget >= ${this.minBudget.value}`,
    });
  }
}
