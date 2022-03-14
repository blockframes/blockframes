import type {
  Language,
  MediaValue,
  Scoring,
  Certification,
  Color,
  Rating,
  SoundFormat,
  MovieFormatQuality,
  MovieFormat,
  Genre,
  ContentType,
  ProductionStatus,
  StoreStatus,
  PremiereType,
  UnitBox,
  ShootingPeriod,
  HostedVideoType,
  Territory,
  SocialGoal,
  NumberRange,
  ScreeningStatus,
} from '@blockframes/utils/static-model/types';
import { MovieLanguageType, productionStatus } from '@blockframes/utils/static-model';
import { toDate } from '@blockframes/utils/helpers';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { App, getAllAppsExcept } from '@blockframes/utils/apps';
import {
  Producer,
  Crew,
  Cast,
  Stakeholder,
  Director,
} from '@blockframes/utils/common-interfaces/identity';
import { AnalyticsEvents, AnalyticsBase } from '@blockframes/utils/analytics/analytics-model';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { StorageFile, StorageVideo } from '@blockframes/media/+state/media.firestore';
import type firestore from 'firebase/firestore';

//////////////////
// MOVIE OBJECT //
//////////////////

/** Generic interface of a Movie */
export interface MovieBase<D> {
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta<D>;
  id: string;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  app: Partial<{ [app in App]: MovieAppConfig<D> }>; //! required
  audience?: MovieGoalsAudience;
  banner?: StorageFile;
  boxOffice?: BoxOffice[];
  cast?: Cast[];
  certifications?: Certification[];
  color?: Color;
  contentType: ContentType; //! required
  crew?: Crew[];
  directors: Director[]; //! required
  estimatedBudget?: NumberRange;
  expectedPremiere?: MovieExpectedPremiereRaw<D>;
  format?: MovieFormat;
  formatQuality?: MovieFormatQuality;
  genres: Genre[]; //! required
  customGenres?: string[];
  internalRef?: string;
  isOriginalVersionAvailable: boolean;
  keyAssets?: string;
  keywords?: string[];
  languages?: LanguageRecord;
  logline?: string;
  originalLanguages: Language[]; //! required
  originalRelease?: MovieOriginalReleaseRaw<D>[];
  originCountries: Territory[]; //! required
  poster?: StorageFile;
  prizes?: Prize[];
  customPrizes?: Prize[];
  producers?: Producer[];
  productionStatus?: ProductionStatus;
  rating?: MovieRating[];
  release: MovieRelease; //! required
  review?: MovieReview[];
  runningTime?: MovieRunningTime;
  scoring?: Scoring;
  shooting?: MovieShooting;
  soundFormat?: SoundFormat;
  stakeholders?: MovieStakeholders;
  synopsis: string; //! required
  title: Title; //! required
  orgIds: string[]; //! required
  campaignStarted: D;

  //CATALOG specific
  delivery?: {
    file: StorageFile;
  };
}

/** Document model of a Movie */
export type MovieDocument = MovieBase<Timestamp>;

export interface MovieVideos {
  screener?: MovieVideo; // Main screener
  salesPitch?: MovieVideo; // Sales pitch
  otherVideos?: MovieVideo[]; // Other videos
}

export interface MovieVideo extends StorageVideo {
  title?: string;
  description?: string;
  type?: HostedVideoType;
}

////////////////////
// MOVIE SECTIONS //
////////////////////

export interface MoviePromotionalElements {
  moodboard: StorageFile;
  notes: MovieNote[];
  presentation_deck: StorageFile;
  scenario: StorageFile;
  still_photo: StorageFile[];
  videos?: MovieVideos;
}

////////////////////
// MOVIE DETAILS //
////////////////////

type Timestamp = firestore.Timestamp;

export interface MovieAppConfig<D> {
  acceptedAt: D;
  access: boolean;
  refusedAt: D;
  status: StoreStatus;
}

export type MovieAppConfigRecord = Record<App, MovieAppConfig<Date>>;

export interface Prize {
  name: string;
  year?: number;
  prize?: string;
  logo?: string;
  premiere?: PremiereType;
}

export interface Title {
  original: string;
  international?: string;
  series?: number;
}

export interface BoxOffice {
  unit: UnitBox;
  value?: number;
  territory: Territory;
}

export interface MovieLanguageSpecification {
  dubbed: boolean;
  subtitle: boolean;
  caption: boolean;
}

export type LanguageRecord = Partial<{ [language in Language]: MovieLanguageSpecification }>;

export interface MovieOriginalReleaseRaw<D> {
  date: D;
  country: Territory;
  media?: MediaValue;
}

export type MovieOriginalRelease = MovieOriginalReleaseRaw<Date>;

export interface MovieRating {
  country: Territory;
  reason?: string;
  system?: Rating;
  value: string;
}

export interface MovieReview {
  criticName?: string;
  journalName?: string;
  criticQuote?: string;
  revueLink?: string;
}

export interface MovieStakeholders {
  productionCompany: Stakeholder[];
  coProductionCompany: Stakeholder[];
  broadcasterCoproducer: Stakeholder[];
  lineProducer: Stakeholder[];
  distributor: Stakeholder[];
  salesAgent: Stakeholder[];
  laboratory: Stakeholder[];
  financier: Stakeholder[];
}

export interface MovieRelease {
  year?: number;
  status: ScreeningStatus;
}

export interface MovieRunningTime {
  time?: number;
  status?: ScreeningStatus;
  episodeCount?: number;
}

export interface MovieShootingRaw<D> {
  dates?: MovieShootingDateRaw<D>;
  locations?: MovieShootingLocations[];
}

export type MovieShooting = MovieShootingRaw<Date>;

export interface MovieShootingLocations {
  cities?: string[];
  country?: Territory;
}

export interface MovieShootingDateRaw<D> {
  completed?: D;
  progress?: D;
  planned?: MoviePlannedShootingDateRange;
}

export type MovieShootingDate = MovieShootingDateRaw<Date>;

export type MovieNote = { firstName: string; lastName: string; role: string } & StorageFile;

export interface MoviePlannedShootingDateRange {
  from?: MoviePlannedShooting;
  to?: MoviePlannedShooting;
}

export interface MoviePlannedShooting {
  period?: ShootingPeriod;
  month?: string;
  year?: number;
}

export interface MovieExpectedPremiereRaw<D> {
  date?: D;
  event?: string;
}

export type MovieExpectedPremiere = MovieExpectedPremiereRaw<Date>;

export interface MovieGoalsAudience {
  targets: string[];
  goals: SocialGoal[];
}

/////////////////////
// MOVIE ANALYTICS //
/////////////////////

export interface MovieEventAnalytics {
  event_date: string;
  event_name: AnalyticsEvents;
  hits: number;
  movieId: string;
}

export interface MovieAnalytics extends AnalyticsBase {
  addedToWishlist: {
    current: MovieEventAnalytics[];
    past: MovieEventAnalytics[];
  };
  movieViews: {
    current: MovieEventAnalytics[];
    past: MovieEventAnalytics[];
  };
  promoReelOpened: {
    current: MovieEventAnalytics[];
    past: MovieEventAnalytics[];
  };
}

// Export for other files
export { Credit } from '@blockframes/utils/common-interfaces/identity';

export type Movie = MovieBase<Date>;

export interface SyncMovieAnalyticsOptions {
  filterBy: (movie: Movie) => boolean;
}

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    _type: 'movies',
    // Mandatory fields
    contentType: 'movie',
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
    notes: params?.notes?.map((note) => createMovieNote(note)) ?? [],
    still_photo: params?.still_photo?.map((still) => createStorageFile(still)) ?? [],
    presentation_deck: createStorageFile(params?.presentation_deck),
    scenario: createStorageFile(params?.scenario),
    videos: createMovieVideos(params?.videos),
  };
}

export function createLanguageKey(languages: LanguageRecord = {}): LanguageRecord {
  const languageSpecifications: LanguageRecord = {};
  for (const language in languages) {
    languageSpecifications[language] = createMovieLanguageSpecification(languages[language]);
  }
  return languageSpecifications;
}

export function createMovieLanguageSpecification(
  params: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    dubbed: false,
    subtitle: false,
    caption: false,
    ...params,
  };
}

export function createAppConfig(params: Partial<MovieAppConfig<Date>>) {
  return {
    status: 'draft',
    access: false,
    ...params,
    acceptedAt: toDate(params?.acceptedAt),
    refusedAt: toDate(params?.refusedAt),
  };
}

export function createMovieAppConfig(
  _appAccess: Partial<{ [app in App]: MovieAppConfig<Date> }> = {}
): MovieAppConfigRecord {
  const appAccess = {};
  const apps = getAllAppsExcept(['crm']);
  for (const a of apps) {
    appAccess[a] = createAppConfig(_appAccess[a]);
  }
  return appAccess as MovieAppConfigRecord;
}

export function createMovieRating(params: Partial<MovieRating> = {}): MovieRating {
  return {
    country: null,
    value: '',
    ...params,
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
    ...prize,
  };
}

export function createTitle(title: Partial<Title> = {}): Title {
  return {
    original: '',
    international: '',
    ...title,
  };
}

export function createReleaseYear(release: Partial<MovieRelease> = {}): MovieRelease {
  return {
    status: null,
    ...release,
  };
}

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: 'usd',
    territory: null,
    ...params,
  };
}

export function createMovieStakeholders(
  stakeholders: Partial<MovieStakeholders> = {}
): MovieStakeholders {
  return {
    productionCompany: [],
    coProductionCompany: [],
    broadcasterCoproducer: [],
    lineProducer: [],
    distributor: [],
    salesAgent: [],
    laboratory: [],
    financier: [],
    ...stakeholders,
  };
}

export function populateMovieLanguageSpecification(
  spec: LanguageRecord,
  slug: Language,
  type: MovieLanguageType,
  value = true
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
    dates: createShootingDate(params.dates),
  };
}

export function createShootingDate(params: Partial<MovieShootingDate> = {}): MovieShootingDate {
  return {
    planned: {},
    ...params,
  };
}

export function createShootingPlannedObject(params: Partial<MoviePlannedShooting> = {}) {
  return {
    period: '',
    month: '',
    ...params,
  };
}

export function createExpectedPremiere(
  params: Partial<MovieExpectedPremiere> = {}
): MovieExpectedPremiere {
  return {
    event: '',
    ...params,
    date: toDate(params.date),
  };
}

export function createAudienceGoals(params: Partial<MovieGoalsAudience> = {}): MovieGoalsAudience {
  return {
    targets: [],
    goals: [],
    ...params,
  };
}

export function createMovieNote(params: Partial<MovieNote> = {}): MovieNote {
  const file = createStorageFile(params);
  return {
    firstName: '',
    lastName: '',
    role: '',
    ...file,
    ...params,
  };
}

/**
 * Takes an array of movies and returns a list of their titles.
 * @param movies
 */
export function getMovieTitleList(movies: Movie[]): string[] {
  const movieTitles = movies.map((movie) =>
    movie.title.international ? movie.title.international : movie.title.original
  );
  return movieTitles;
}

/**
 * Returns the number of views of a movie page.
 * @param analytics
 * @param movieId
 */
export function getMovieTotalViews(analytics: MovieAnalytics[], movieId: string): number {
  const movieAnalytic = analytics.find((analytic) => analytic.id === movieId);
  if (movieAnalytic) {
    const movieHits = movieAnalytic.movieViews.current.map((event) => event.hits);
    return movieHits.reduce((sum, val) => sum + val, 0);
  }
}

export function createMovieVideos(params: Partial<MovieVideos>): MovieVideos {
  return {
    ...params,
    screener: createMovieVideo(params?.screener),
    salesPitch: createMovieVideo(params?.salesPitch),
    otherVideos: params?.otherVideos?.map((video) => createMovieVideo(video)) || [],
  };
}

export function createMovieVideo(params: Partial<MovieVideo>): MovieVideo {
  return {
    jwPlayerId: '',
    ...params,
    ...createStorageFile(params),
  };
}

export function getAllowedproductionStatuses(app: App): ProductionStatus[] {
  return Object.keys(productionStatus)
    .filter((status) => (app === 'catalog' ? status === 'released' : true))
    .map((s) => s as ProductionStatus);
}
