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
  MovieShooting,
  MovieShootingDate,
  MovieExpectedPremiere,
  MoviePlannedShooting,
  MovieGoalsAudience,
  MovieSalesPitch,
  MovieNote,
  MovieTotalBudget
} from './movie.firestore';
import { DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { Contract, getValidatedContracts } from '@blockframes/contract/contract/+state/contract.model';
import { createMovieAppAccess } from '@blockframes/utils/apps';
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
    totalBudget: {},

    ...params,
    banner: params.banner ?? '',
    estimatedBudget: createRange<number>(params.estimatedBudget),
    expectedPremiere: createExpectedPremiere(params.expectedPremiere),
    goals: createAudienceGoals(params.goals),
    languages: createLanguageKey(params.languages ? params.languages : {}),
    poster: params.poster ?? '',
    promotional: createMoviePromotional(params.promotional),
    release: createReleaseYear(params.release),
    runningTime: createRunningTime(params.runningTime),
    shooting: createShooting(params.shooting),
    stakeholders: createMovieStakeholders(params.stakeholders),
    storeConfig: createStoreConfig(params.storeConfig),
    title: createTitle(params.title),
  };
}

export function createMoviePromotional(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {
  return {
    ...params,
    clip_link: params.clip_link ?? '',
    financialDetails: params.financialDetails ?? '',
    moodboard: params.moodboard ?? '',
    notes: params.notes ?? [],
    salesPitch: createSalesPitch(params.salesPitch),
    still_photo: params.still_photo ?? [],
    presentation_deck: params.presentation_deck ?? '',
    scenario: params.scenario ?? '',
    promo_reel_link: params.promo_reel_link ?? '',
    screener_link: params.screener_link ?? '',
    trailer_link: params.trailer_link ?? '',
    teaser_link: params.teaser_link ?? '',
    other_links: params.other_links ?? [],
  };
}

export function createSalesPitch(params: Partial<MovieSalesPitch>): MovieSalesPitch {
  return {
    description: '',
    link: '',
    file: '',
    ...params,
  }
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

export function createShooting(params: Partial<MovieShooting> = {}): MovieShooting {
  return {
    locations: [],
    ...params,
    dates: createShootingDate(params.dates)
  }
}

export function createShootingDate(params: Partial<MovieShootingDate> = {}): MovieShootingDate {
  return {
    ...params
  }
}

export function createShootingPlannedObject(params: Partial<MoviePlannedShooting>) {
  return {
    period: '',
    month: '',
    year: null,
    ...params
  }
}

export function createExpectedPremiere(params: Partial<MovieExpectedPremiere> = {}): MovieExpectedPremiere {
  return {
    event: '',
    ...params,
    date: toDate(params.date)
  }
}

export function createAudienceGoals(params: Partial<MovieGoalsAudience> = {}): MovieGoalsAudience {
  return {
    target: [],
    goal: [],
    ...params,
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

export function createMovieNote(note: Partial<MovieNote> = {}): MovieNote {
  return {
    ref: '',
    ...note
  }
}
