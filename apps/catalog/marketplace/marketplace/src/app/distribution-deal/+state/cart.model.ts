import { MovieLanguageSpecification } from './../../movie/search/search.form';
import { DateRange } from '@blockframes/utils/date-range';
import {
  MovieCurrenciesSlug,
  MediasSlug,
  LanguagesSlug,
  TerritoriesSlug
} from '@blockframes/movie/movie/static-model/types';

export const enum CartStatus {
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

export interface CatalogCart {  // @todo #1061 => Cart & add to draw.io => pouvoir avoir n cart sur l'org. Ajouter un "name" au cart. Idem wishlist
  name: string;
  status: CartStatus;
  deals: DistributionRight[]; //string[]; // #1061  MovieSaleIds in movies/{$id}/distributiondeals
  price: Price;
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
 * A factory function that creates Price
 */
export function createPrice(price: Partial<Price> = {}): Price {
  return {
    amount: 0,
    currency: 'euro',
    ...price
  }
}

/**
 * A factory function that creates Cart
 */
export function createCart(cart: Partial<CatalogCart> = {}): CatalogCart {
  return {
    name: 'default',
    status: CartStatus.pending,
    price: createPrice(),
    deals: [],
    ...cart
  }
}

/**
 * 
 * @param right 
 */
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