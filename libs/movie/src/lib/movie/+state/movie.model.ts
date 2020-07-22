import {
  MovieBudget,
  MovieFestivalPrizes,
  MovieMain,
  MovieProduction,
  MoviePromotionalDescription,
  MoviePromotionalElements,
  MovieReview,
  MovieSalesCast,
  MovieSalesInfoDocumentWithDates as MovieSalesInfo,
  MovieStory,
  Prize,
  PromotionalElement,
  MovieLanguageSpecificationContainer,
  Title,
  MovieLanguageSpecification,
  MovieLanguageTypes,
  StoreConfig,
  MovieOriginalRelease,
  MovieRating,
  MovieDocumentWithDates,
  BoxOffice,
  MovieStakeholders,
  MovieAnalytics,
  MovieLegalDocuments,
  DocumentMeta,
  LanguageRecord,
  PromotionalExternalMedia,
  PromotionalHostedMedia,
} from './movie.firestore';
import { createExternalMedia, createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { LanguagesSlug } from '@blockframes/utils/static-model';
import { createRange } from '@blockframes/utils/common-interfaces/range';
import { DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { Contract, getValidatedContracts } from '@blockframes/contract/contract/+state/contract.model';
import { toDate } from '@blockframes/utils/helpers';
import { createPrice } from '@blockframes/utils/common-interfaces';
import { createMovieAppAccess } from '@blockframes/utils/apps';

// Export for other files
export { Credit, SalesAgent } from '@blockframes/utils/common-interfaces/identity';
export {
  PromotionalElement,
  MovieBudget,
  MovieFestivalPrizes,
  MovieMain,
  MoviePromotionalDescription,
  MoviePromotionalElements,
  MovieSalesCast,
  MovieStory,
  MovieVersionInfo,
  MovieStakeholders,
  Prize,
  MovieSalesInfoDocumentWithDates as MovieSalesInfo,
  MovieAnalytics,
  MovieReview
} from './movie.firestore';

export interface Movie extends MovieDocumentWithDates {
  distributionRights?: DistributionRight[]
}

export interface SyncMovieAnalyticsOptions {
  filterBy: (movie: Movie) => boolean
}

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    _type: 'movies',
    documents: createMovieLegalDocuments(params.documents),
    movieReview: [],
    ...params,
    versionInfo: { languages: createLanguageKey(params.versionInfo?.languages ? params.versionInfo.languages : {}) },
    main: createMovieMain(params.main),
    story: createMovieStory(params.story),
    promotionalElements: createMoviePromotionalElements(params.promotionalElements),
    promotionalDescription: createMoviePromotionalDescription(params.promotionalDescription),
    salesCast: createMovieSalesCast(params.salesCast),
    salesInfo: createMovieSalesInfo(params.salesInfo),
    festivalPrizes: createMovieFestivalPrizes(params.festivalPrizes),
    budget: createMovieBudget(params.budget),
    production: createMovieProduction(params.production),
  };
}

export function createLanguageKey(languages: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }> = {}): LanguageRecord {
  const languageSpecifications = {}
  for (const language in languages) {
    languageSpecifications[language] = createMovieLanguageSpecification(languages[language])
  }
  return (languageSpecifications as Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>)
}

/** A factory function that creates MovieMain */
export function createMovieMain(params: Partial<MovieMain> = {}): MovieMain {
  return {
    title: {
      original: '',
      international: ''
    },
    directors: [],
    genres: [],
    contentType: 'feature_film',
    originalLanguages: [],
    originCountries: [],
    status: null,
    customGenres: [],
    releaseYear: null,
    ...params,
    storeConfig: createStoreConfig(params.storeConfig),
    banner: createPromotionalImage(params.banner),
    poster: createPromotionalImage(params.poster),
  };
}

/** A factory function that creates Production section */
export function createMovieProduction(params: Partial<MovieProduction> = {}): MovieProduction {
  return {
    stakeholders: createMovieStakeholders(params.stakeholders),
  };
}

export function createMoviePromotionalElements(
  params: Partial<MoviePromotionalElements> = {},
  initDefault: boolean = true
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

export function createMoviePromotionalDescription(
  params: Partial<MoviePromotionalDescription> = {}
): MoviePromotionalDescription {
  return {
    keyAssets: '',
    keywords: [],
    ...params
  };
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

export function createMovieSalesCast(params: Partial<MovieSalesCast> = {}): MovieSalesCast {
  return {
    producers: [],
    cast: [],
    crew: [],
    ...params
  };
}

export function createMovieOriginalRelease(
  params: Partial<MovieOriginalRelease> = {}
): MovieOriginalRelease {
  return {
    country: null,
    ...params,
    date: toDate(params.date),
  };
}

export function createMovieRating(params: Partial<MovieRating> = {}): MovieRating {
  return {
    country: null,
    value: '',
    ...params
  };
}

export function createMovieSalesInfo(params: Partial<MovieSalesInfo> = {}): MovieSalesInfo {
  return {
    certifications: [],
    broadcasterCoproducers: [],
    scoring: null,
    color: null,
    rating: [],
    originalRelease: [],
    format: null,
    formatQuality: null,
    soundFormat: '',
    physicalHVRelease: null,
    ...params
  };
}

export function createMovieStory(params: Partial<MovieStory> = {}): MovieStory {
  return {
    synopsis: '',
    logline: '',
    ...params
  };
}

export function createMovieFestivalPrizes(
  params: Partial<MovieFestivalPrizes> = {}
): MovieFestivalPrizes {
  return {
    prizes: [],
    ...params
  };
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    logo: createHostedMedia(),
    ...prize
  };
}

export function createTitle(title: Partial<Title> = {}): Title {
  return {
    original: '',
    international: '',
    ...title
  };
}

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'boxoffice_dollar',
    value: 0,
    territory: null,
    ...params,
  }
}

export function createMovieBudget(params: Partial<MovieBudget> = {}): MovieBudget {
  return {
    boxOffice: [],
    ...params,
    totalBudget: createPrice(params.totalBudget),
    estimatedBudget: createRange<number>(params.estimatedBudget),
  };
}

export function createMovieReview(params: Partial<MovieReview> = {}): MovieReview {
  return {
    criticName: '',
    journalName: '',
    criticQuote: '',
    revueLink: '',
    ...params,
  };
}

export function createMovieLanguageSpecification(
  params: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    caption: false,
    ...params
  };
}

export function populateMovieLanguageSpecification(
  spec: Partial<MovieLanguageSpecificationContainer>,
  slug: LanguagesSlug,
  type: MovieLanguageTypes,
  value: boolean = true
) {
  if (!spec[slug]) {
    spec[slug] = createMovieLanguageSpecification();
  }

  spec[slug][type] = value;
  return spec;
}

export function createStoreConfig(params: Partial<StoreConfig> = {}): StoreConfig {
  return {
    status: 'draft',
    storeType: 'line_up',
    ...params,
    appAccess: createMovieAppAccess(params.appAccess)
  };
}

export function createMovieLanguage(
  movieLanguage: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    ...movieLanguage
  } as MovieLanguageSpecification;
}

export function createMovieStakeholders(stakeholders: Partial<MovieStakeholders> = {}): MovieStakeholders {
  return {
    executiveProducer: [],
    coProducer: [],
    broadcasterCoproducer: [],
    lineProducer: [],
    distributor: [],
    salesAgent: [],
    laboratory: [],
    financier: [],
    ...stakeholders
  }
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
  const movieTitles = movies.map(movie => movie.main.title.international
    ? movie.main.title.international
    : movie.main.title.original
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
