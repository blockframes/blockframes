import {
  MoviePromotionalElements,
  PromotionalElement,
  Title,
  StoreConfig,
  MovieDocumentWithDates,
  MovieAnalytics,
  MovieLegalDocuments,
  DocumentMeta,
  PromotionalExternalMedia,
  PromotionalHostedMedia,
} from './movie.firestore';
import { createExternalMedia, createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { Contract, getValidatedContracts } from '@blockframes/contract/contract/+state/contract.model';
import { createMovieAppAccess } from '@blockframes/utils/apps';

// Export for other files
export { Credit, SalesAgent } from '@blockframes/utils/common-interfaces/identity';
export {
  PromotionalElement,
  MoviePromotionalElements,
  MovieStakeholders,
  Prize,
  MovieAnalytics,
  MovieReview
} from './movie.firestore';

export interface Movie extends MovieDocumentWithDates {
  distributionRights?: DistributionRight[]
}

export interface SyncMovieAnalyticsOptions {
  filterBy: (movie: Movie) => boolean
}

/** A factory function that creates Movie with only required fields */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    _type: 'movies',
    documents: createMovieLegalDocuments(params.documents),
    contentType: 'feature_film',
    directors: [],
    genres: [],
    originalLanguages: [],
    originCountries: [],
    releaseYear: null,
    storeConfig: createStoreConfig(),
    synopsis: '',
    title: createTitle(),
    ...params,
    promotional: createMoviePromotional(params.promotional),
  };
}

export function createMoviePromotional(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {

  const newStills: Record<string, PromotionalHostedMedia> = {};
  for (const key in params.still_photo) {
    newStills[key] = createPromotionalHostedMedia(params.still_photo[key]);
  }

  const elements: MoviePromotionalElements = {
    ...params,
    still_photo: newStills,
    presentation_deck: createPromotionalHostedMedia(params.presentation_deck),
    scenario: createPromotionalHostedMedia(params.scenario),
    promo_reel_link: createPromotionalExternalMedia(params.promo_reel_link),
    screener_link: createPromotionalExternalMedia(params.screener_link),
    trailer_link: createPromotionalExternalMedia(params.trailer_link),
    teaser_link: createPromotionalExternalMedia(params.teaser_link),
  };

  return elements;
}


function createPromotionalElement(
  promotionalElement: Partial<PromotionalElement> = {}
): PromotionalElement {
  promotionalElement = promotionalElement || {};
  return {
    label: '',
    ...promotionalElement
  }
}

export function createPromotionalExternalMedia(
  promotionalExternalMedia: Partial<PromotionalExternalMedia> = {}
): PromotionalExternalMedia {
  const promotionalElement = createPromotionalElement(promotionalExternalMedia);
  return {
    ...promotionalElement,
    ...promotionalExternalMedia,
    media: createExternalMedia(promotionalExternalMedia.media),
  };
}

export function createPromotionalHostedMedia(
  promotionalHostedMedia: Partial<PromotionalHostedMedia> = {}
): PromotionalHostedMedia {
  const promotionalElement = createPromotionalElement(promotionalHostedMedia);
  return {
    ...promotionalElement,
    ...promotionalHostedMedia,
    media: createHostedMedia(promotionalHostedMedia.media),
  };
}

export function createTitle(title: Partial<Title> = {}): Title {
  return {
    original: '',
    international: '',
    ...title
  };
}

export function createStoreConfig(params: Partial<StoreConfig> = {}): StoreConfig {
  return {
    status: 'draft',
    storeType: 'line_up',
    ...params,
    appAccess: createMovieAppAccess(params.appAccess)
  };
}

export function createMovieLegalDocuments(
  params: Partial<MovieLegalDocuments> = {}
): MovieLegalDocuments {
  return {
    chainOfTitles: [],
    ...params
  }
}

export function createDocumentMeta(meta: Partial<DocumentMeta> = {}): DocumentMeta {
  return {
    createdBy: '',
    ...meta
  }
}

/**
 * Takes an array of movies and returns a list of their titles.
 * @param movies
 */
export function getMovieTitleList(movies: Movie[]): string[] {
  const movieTitles = movies.map(movie => movie.title.international
    ? movie.title.international
    : movie.title.original
  )
  return movieTitles;
}

/**
 * Returns the total gross receipts of a movie from the contracts.
 * @param contracts
 * @param movieId
 */
export function getMovieReceipt(contracts: Contract[], movieId: string): number {
  const sales = getValidatedContracts(contracts);
  return sales.reduce((sum, contract) => sum + contract.lastVersion.titles[movieId].price.amount, 0);
}

/**
 * Returns the number of views of a movie page.
 * @param analytics
 * @param movieId
 */
export function getMovieTotalViews(analytics: MovieAnalytics[], movieId: string): number {
  const movieAnalytic = analytics.find(analytic => analytic.movieId === movieId);
  if (movieAnalytic) {
    const movieHits = movieAnalytic.movieViews.current.map(event => event.hits);
    return movieHits.reduce((sum, val) => sum + val, 0);
  }
}
