
import { GenresSlug, LanguagesSlug, TerritoriesSlug, MovieStatusSlug } from '@blockframes/utils/static-model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';

/** Return true only the array are equals, **the order of the elements doesn't matter** */
function arrayEquals(a: any[], b: any[]) {
  return (
    a.length === b.length &&
    a.every(aa => b.some(bb => aa === bb))
  );
}


// TODO extract that (along with other potential common features) into an algolia file
export interface AlgoliaSearch {
  query: string;
}

export interface MovieSearch extends AlgoliaSearch {
  genres: GenresSlug[];
  originCountries: TerritoriesSlug[];
  languages: {
    original: LanguagesSlug[],
    dubbed: LanguagesSlug[],
    subtitle: LanguagesSlug[],
    caption: LanguagesSlug[],
  };
  productionStatus: MovieStatusSlug[];
  budget: NumberRange[];
  sellers: string[];
}

function createMovieSearch(search: Partial<MovieSearch> = {}): MovieSearch {
  return {
    query: '',
    genres: [],
    originCountries: [],
    languages: {
      original: [],
      dubbed: [],
      subtitle: [],
      caption: [],
    },
    productionStatus: [],
    budget: [],
    sellers: [],
    ...search,
  };
}

function createMovieSearchControl(search: MovieSearch) {
  return {
    query: new FormControl(search.query),
    genres: FormList.factory<ExtractSlug<'GENRES'>>(search.genres),
    originCountries: FormList.factory<ExtractSlug<'TERRITORIES'>>(search.originCountries),
    languages: new FormGroup({
      original: FormList.factory<ExtractSlug<'LANGUAGES'>>(search.languages.original),
      dubbed: FormList.factory<ExtractSlug<'LANGUAGES'>>(search.languages.dubbed),
      subtitle: FormList.factory<ExtractSlug<'LANGUAGES'>>(search.languages.subtitle),
      caption: FormList.factory<ExtractSlug<'LANGUAGES'>>(search.languages.caption),
    }),
    productionStatus: FormList.factory<ExtractSlug<'MOVIE_STATUS'>>(search.productionStatus),
    budget: FormList.factory<NumberRange>(search.budget),
    sellers: FormList.factory<string>(search.sellers),
  };
}

export type MovieSearchControl = ReturnType<typeof createMovieSearchControl>;

export class MovieSearchForm extends FormEntity<MovieSearchControl> {
  constructor(search: Partial<MovieSearch> = {}) {
    const movieSearch = createMovieSearch(search);
    const control = createMovieSearchControl(movieSearch);
    super(control);
  }

  static equals(a: MovieSearch, b: MovieSearch) {
    return (
      a.query === b.query &&
      arrayEquals(a.genres, b.genres) &&
      arrayEquals(a.originCountries, b.originCountries) &&
      arrayEquals(a.languages.original, b.languages.original) &&
      arrayEquals(a.languages.dubbed, b.languages.dubbed) &&
      arrayEquals(a.languages.subtitle, b.languages.subtitle) &&
      arrayEquals(a.languages.caption, b.languages.caption) &&
      arrayEquals(a.productionStatus, b.productionStatus) &&
      arrayEquals(a.budget, b.budget) &&
      arrayEquals(a.sellers, b.sellers)
    );
  }

  static isEmpty(search: MovieSearch) {
    return (
      search.query === '' &&
      search.genres.length === 0 &&
      search.originCountries.length === 0 &&
      search.languages.original.length === 0 &&
      search.languages.dubbed.length === 0 &&
      search.languages.subtitle.length === 0 &&
      search.languages.caption.length === 0 &&
      search.productionStatus.length === 0 &&
      search.budget.length === 0 &&
      search.sellers.length === 0
    );
  }

  get query() { return this.get('query'); }
  get genres() { return this.get('genres'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get budget() { return this.get('budget'); }
  get sellers() { return this.get('sellers'); }

  /** Convert the form into an Algolia query ready to be fired */
  toAlgoliaQuery() {

    const facetFilters = [
      [...this.genres.value.map(genre => `genres:${genre}`)], // same facet inside an array means OR for algolia
      [...this.originCountries.value.map(country => `originCountries:${country}`)],
      [
        ...this.languages.value.original.map(lang => `languages.original:${lang}`),
        ...this.languages.value.dubbed.map(lang => `languages.dubbed:${lang}`),
        ...this.languages.value.subtitle.map(lang => `languages.subtitle:${lang}`),
        ...this.languages.value.caption.map(lang => `languages.caption:${lang}`),
      ],
      [...this.productionStatus.value.map(status => `status:${status}`)],
      [...this.sellers.value.map(seller => `orgName:${seller}`)],
    ];

    const budgetsFrom = this.budget.value.map(budget => `budget.from:${budget.from}`).join(' OR ');
    const budgetsTo = this.budget.value.map(budget => `budget.to:${budget.to}`).join(' OR ');

    let budgetFilter = ''
    if ( this.budget.value.length === 1) {
      budgetFilter = `${budgetsFrom} AND ${budgetsTo}`;
    } else if ( this.budget.value.length > 1) {
      budgetFilter =  `(${budgetsFrom}) AND (${budgetsTo})`;
    }

    return {
      query: this.query.value,
      facetFilters,
      filters: budgetFilter,
    }
  }
}
