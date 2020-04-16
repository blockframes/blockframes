
import { GenresSlug, LanguagesSlug, TerritoriesSlug, MovieStatusSlug } from '@blockframes/utils/static-model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';

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

  get query() { return this.get('query'); }
  get genres() { return this.get('genres'); }
  get originCountries() { return this.get('originCountries'); }
  get languages() { return this.get('languages'); }
  get productionStatus() { return this.get('productionStatus'); }
  get budget() { return this.get('budget'); }
  get sellers() { return this.get('sellers'); }
}
