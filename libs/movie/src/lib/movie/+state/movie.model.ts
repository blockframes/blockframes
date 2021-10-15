import {
  MoviePromotionalElements,
  MovieLanguageSpecificationContainer,
  Title,
  MovieAnalytics,
  MovieStakeholders,
  MovieLanguageSpecification,
  LanguageRecord,
  MovieRating,
  MovieReview,
  MovieOriginalRelease,
  Prize,
  BoxOffice,
  MovieRelease,
  MovieShooting,
  MovieShootingDate,
  MovieExpectedPremiere,
  MoviePlannedShooting,
  MovieGoalsAudience,
  MovieVideos,
  MovieVideo,
  MovieBase,
  MovieNote,
  MovieAppConfig,
  MovieAppConfigRecord
} from './movie.firestore';
import { Language, MovieLanguageType } from '@blockframes/utils/static-model';
import { toDate } from '@blockframes/utils/helpers';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { App, getAllAppsExcept } from '@blockframes/utils/apps';

// Export for other files
export { Credit } from '@blockframes/utils/common-interfaces/identity';
export {
  MoviePromotionalElements,
  MovieStakeholders,
  Prize,
  MovieAnalytics,
  MovieReview
} from './movie.firestore';

export type Movie = MovieBase<Date>

export interface SyncMovieAnalyticsOptions {
  filterBy: (movie: Movie) => boolean
}

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    _type: 'movies',
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
    runningTime: {},
    scoring: null,
    soundFormat: null,
    isOriginalVersionAvailable: null,
    estimatedBudget: null,
    orgIds: [],
    ...params,
    app: createMovieAppConfig(params.app),
    expectedPremiere: createExpectedPremiere(params.expectedPremiere),
    campaignStarted: params.campaignStarted ? toDate(params.campaignStarted) : null,
    banner: createStorageFile(params?.banner),
    audience: createAudienceGoals(params.audience),
    languages: createLanguageKey(params.languages ? params.languages : {}),
    poster: createStorageFile(params?.poster),
    promotional: createMoviePromotional(params.promotional),
    release: createReleaseYear(params.release),
    shooting: createShooting(params.shooting),
    stakeholders: createMovieStakeholders(params.stakeholders),
    title: createTitle(params.title),
  };
}

export function createMoviePromotional(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {
  return {
    ...params,
    moodboard: createStorageFile(params?.moodboard),
    notes: params?.notes?.map(note => createMovieNote(note)) ?? [],
    still_photo: params?.still_photo?.map(still => createStorageFile(still)) ?? [],
    presentation_deck: createStorageFile(params?.presentation_deck),
    scenario: createStorageFile(params?.scenario),
    videos: createMovieVideos(params?.videos),
  };
}

export function createLanguageKey(languages: Partial<{ [language in Language]: MovieLanguageSpecification }> = {}): LanguageRecord {
  const languageSpecifications = {}
  for (const language in languages) {
    languageSpecifications[language] = createMovieLanguageSpecification(languages[language])
  }
  return (languageSpecifications as Partial<{ [language in Language]: MovieLanguageSpecification }>)
}

export function createMovieLanguageSpecification(
  params: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    dubbed: false,
    subtitle: false,
    caption: false,
    ...params
  };
}

export function createAppConfig(params: Partial<MovieAppConfig<Date>>) {
  return {
    status: 'draft',
    access: false,
    ...params,
    acceptedAt: toDate(params?.acceptedAt),
    refusedAt: toDate(params?.refusedAt),
  }
}

export function createMovieAppConfig(_appAccess: Partial<{[app in App]: MovieAppConfig<Date>}> = {}): MovieAppConfigRecord {
  const appAccess = {};
  const apps = getAllAppsExcept(['crm']);
  for (const a of apps) {
    appAccess[a] = createAppConfig(_appAccess[a]);
  }
  return (appAccess as MovieAppConfigRecord);
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

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'usd',
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
  slug: Language,
  type: MovieLanguageType,
  value: boolean = true
) {
  if (!spec[slug]) {
    spec[slug] = createMovieLanguageSpecification();
  }

  spec[slug][type] = value;
  return spec;
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
    planned: {},
    ...params
  }
}

export function createShootingPlannedObject(params: Partial<MoviePlannedShooting> = {}) {
  return {
    period: '',
    month: '',
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
    targets: [],
    goals: [],
    ...params,
  }
}

export function createMovieNote(params: Partial<MovieNote> = {}): MovieNote {
  const file = createStorageFile(params);
  return {
    firstName: '',
    lastName: '',
    role: '',
    ...file,
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
 * Returns the number of views of a movie page.
 * @param analytics
 * @param movieId
 */
export function getMovieTotalViews(analytics: MovieAnalytics[], movieId: string): number {
  const movieAnalytic = analytics.find(analytic => analytic.id === movieId);
  if (movieAnalytic) {
    const movieHits = movieAnalytic.movieViews.current.map(event => event.hits);
    return movieHits.reduce((sum, val) => sum + val, 0);
  }
}

export function createMovieVideos(params: Partial<MovieVideos>): MovieVideos {
  return {
    ...params,
    screener: createMovieVideo(params?.screener),
    salesPitch: createMovieVideo(params?.salesPitch),
    otherVideos: params?.otherVideos?.map(video => createMovieVideo(video)) || [],
  }
}

export function createMovieVideo(params: Partial<MovieVideo>): MovieVideo {
  return {
    jwPlayerId: '',
    ...params,
    ...createStorageFile(params),
  }
}
