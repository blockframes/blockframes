import { staticModels, Movie } from '@blockframes/movie';

type Languages = ((typeof staticModels)['LANGUAGES'])[number]['slug'];
type Currency = ((typeof staticModels)['MOVIE_CURRENCIES'])[number]['slug'];
type Media = ((typeof staticModels)['MEDIAS'])[number]['slug'];

export const enum BasketStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface Price {
  amount: number;
  currency: Currency
}

export interface DistributionLanguage {
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
}

export interface DistributionRight {
  id: string;
  movieId: string;
  medias: Media[];
  languages: Partial<{
    [language in keyof Languages]: DistributionLanguage
  }>;
  duration: {
    from: Date,
    to: Date
  };
}

export interface CatalogBasket {
  status: BasketStatus;
  rights: DistributionRight[];
  price: Price;
}

/**
 * A factory function that creates Basket
 */
export function createBasket(basket: Partial<CatalogBasket> = {}) {
  return {
    status: BasketStatus.pending,
    price: 0,
    rights: [],
    ...basket
  } as CatalogBasket;
}
