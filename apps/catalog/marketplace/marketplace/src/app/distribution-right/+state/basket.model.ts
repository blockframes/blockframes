import {
  MovieLanguageSpecification,
  createLanguageControl
} from './../../movie/search/search.form';
import { FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
import { DistributionRight } from './basket.model';
import { DateRange } from '@blockframes/utils/date-range';
import {
  MovieCurrenciesSlug,
  MediasSlug,
  LanguagesSlug,
  TerritoriesSlug
} from '@blockframes/movie/movie/static-model/types';
import { numberRangeValidator, valueIsInModelValidator } from '@blockframes/utils';

export const enum BasketStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface Price {
  amount: number;
  currency: MovieCurrenciesSlug;
}

export interface DistributionRight { // @todo #1061 => distribution deal with specific status
  id: string;
  movieId: string;
  medias: MediasSlug[];
  languages: { [language in LanguagesSlug]: MovieLanguageSpecification };
  duration: DateRange;
  territories: TerritoriesSlug[];
  exclusive: boolean;
}


export interface CatalogBasket {  // @todo #1061 => Cart & add to draw.io => pouvoir avoir n cart sur l'org. Ajouter un "name" au cart. Idem wishlist
  id: string;
  status: BasketStatus;
  rights: DistributionRight[]; //string[]; // #1061  MovieSaleIds in movies/{$id}/distributiondeals
  price: Price;
  name?: string;
}

export interface MovieData {
  id: string;
  movieName: string;
  duration: DateRange;
  territory: string;
  rights: string;
  languages: string;
  dubbed: string;
  subtitle: string;
}

/**
 * A factory function that creates Basket
 */
export function createBasket(basket: Partial<CatalogBasket> = {}) {
  return {
    id: basket.id,
    status: BasketStatus.pending,
    price: 0,
    rights: basket.rights,
    ...basket
  } as CatalogBasket;
}

export function createDistributionRight(right: Partial<DistributionRight> = {}) {
  return {
    id: '',
    movieId: '',
    medias: [],
    languages: [],
    duration: {
      from: '',
      to: ''
    },
    territories: [],
    exclusive: false,
    ...right
  } as DistributionRight;
}

export function createDistributionRightControls(right: Partial<DistributionRight> = {}) {
  // Create controls for the languages
  const languageControl = Object.keys(right.languages).reduce(
    (acc, key) => ({
      ...acc,
      // Key is the name of the language, english, french etc.
      [key]: createLanguageControl(right.languages[key])
    }),
    {} // Initial value. No controls at the beginning
  );
  return {
    medias: new FormArray(right.medias.map(media => new FormControl(media)), [
      Validators.required,
      valueIsInModelValidator('MEDIAS')
    ]),
    languages: new FormGroup(languageControl, Validators.required),
    duration: new FormGroup(
      {
        from: new FormControl(right.duration.from, [Validators.required]),
        to: new FormControl(right.duration.to, [Validators.required])
      },
      [Validators.required, numberRangeValidator('from', 'to')]
    ),
    territories: new FormArray(right.territories.map(territory => new FormControl(territory)), [
      Validators.required,
      valueIsInModelValidator('TERRITORIES')
    ]),
    exclusive: new FormControl(right.exclusive)
  };
}

export type DistributionRightControls = ReturnType<typeof createDistributionRightControls>;
