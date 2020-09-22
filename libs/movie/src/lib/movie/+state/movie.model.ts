import {
  MoviePromotionalElements,
  MovieLanguageSpecificationContainer,
  Title,
  StoreConfig,
  MovieDocumentWithDates,
  MovieAnalytics,
  MovieLegalDocuments,
  DocumentMeta,
  MovieStakeholders,
  MovieLanguageSpecification,
  LanguageRecord,
  MovieRating,
  MovieReview,
  MovieOriginalRelease,
  Prize,
  BoxOffice,
  MovieRelease,
  MovieRunningTime,
  OtherLink,
} from './movie.firestore';
import { DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { Contract, getValidatedContracts } from '@blockframes/contract/contract/+state/contract.model';
import { createMovieAppAccess } from '@blockframes/utils/apps';
import { createPrice } from '@blockframes/utils/common-interfaces';
import { createRange } from '@blockframes/utils/common-interfaces/range';
import { LanguagesSlug, MovieLanguageTypes } from '@blockframes/utils/static-model';
import { toDate } from '@blockframes/utils/helpers';

// Export for other files
export { Credit, SalesAgent } from '@blockframes/utils/common-interfaces/identity';
export {
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

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    _type: 'movies',
    documents: createMovieLegalDocuments(params.documents),
    // Mandatory fields
    contentType: 'feature_film',
    directors: [],
    genres: [],
    originalLanguages: [],
    originCountries: [],
    synopsis: '',
    // Optionnal fields
    boxOffice: [],
    cast: [],
    certifications: [],
    color: null,
    crew: [],
    customGenres: [],
    format: null,
    formatQuality: null,
    hostedVideo: '',
    internalRef: '',
    keyAssets: '',
    keywords: [],
    logline: '',
    originalRelease: [],
    prizes: [],
    customPrizes: [],
    producers: [],
    productionStatus: null,
    rating: [],
    review: [],
    scoring: null,
    soundFormat: '',
    isOriginalVersionAvailable: false,

    ...params,
    banner: params.banner ?? '',
    estimatedBudget: createRange<number>(params.estimatedBudget),
    languages: createLanguageKey(params.languages ? params.languages : {}),
    poster: params.poster ?? '',
    promotional: createMoviePromotional(params.promotional),
    release: createReleaseYear(params.release),
    runningTime: createRunningTime(params.runningTime),
    stakeholders: createMovieStakeholders(params.stakeholders),
    storeConfig: createStoreConfig(params.storeConfig),
    title: createTitle(params.title),
    totalBudget: createPrice(params.totalBudget),
  };
}

export function createMoviePromotional(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {

  const newStills: Record<string, string> = {};
  for (const key in params.still_photo) {
    newStills[key] = params.still_photo[key];
  }

  const elements: MoviePromotionalElements = {
    ...params,
    clip_link: params.clip_link ?? '',
    moodboard: params.moodboard ?? '',
    notes: params.notes ?? '',
    still_photo: newStills,
    presentation_deck: params.presentation_deck ?? '',
    scenario: params.scenario ?? '',
    promo_reel_link: params.promo_reel_link ?? '',
    screener_link: params.screener_link ?? '',
    trailer_link: params.trailer_link ?? '',
    teaser_link: params.teaser_link ?? '',
    other_links: params.other_links ?? [],
  };

  return elements;
}

export function createLanguageKey(languages: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }> = {}): LanguageRecord {
  const languageSpecifications = {}
  for (const language in languages) {
    languageSpecifications[language] = createMovieLanguageSpecification(languages[language])
  }
  return (languageSpecifications as Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>)
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

export function createMovieRating(params: Partial<MovieRating> = {}): MovieRating {
  return {
    country: null,
    value: '',
    ...params
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

export function createMovieOriginalRelease(
  params: Partial<MovieOriginalRelease> = {}
): MovieOriginalRelease {
  return {
    country: null,
    ...params,
    date: toDate(params.date),
  };
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    logo: '',
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

export function createReleaseYear(release: Partial<MovieRelease> = {}): MovieRelease {
  return {
    year: null,
    status: '',
    ...release
  };
}

export function createRunningTime(runningTime: Partial<MovieRunningTime> = {}): MovieRunningTime {
  return {
    time: null,
    status: '',
    ...runningTime
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

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'boxoffice_dollar',
    value: 0,
    territory: null,
    ...params,
  }
}

export function createMovieStakeholders(stakeholders: Partial<MovieStakeholders> = {}): MovieStakeholders {
  return {
    productionCompany: [],
    coProductionCompany: [],
    broadcasterCoproducer: [],
    lineProducer: [],
    distributor: [],
    salesAgent: [],
    laboratory: [],
    financier: [],
    ...stakeholders
  }
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

export function createOtherLink(otherLink: Partial<OtherLink> = {}): OtherLink {
  return {
    name: otherLink.name ?? '',
    url: otherLink.url ?? '',
  }
}
