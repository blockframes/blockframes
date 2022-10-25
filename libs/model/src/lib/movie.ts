import { createStorageFile, StorageFile, StorageVideo } from './media';
import {
  MovieLanguageType,
  Language,
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
  App,
  app,
  productionStatus,
  MovieNoteRole,
  ReleaseMedia,
  ReleaseMediaValue
} from './static';
import type {
  Producer,
  Crew,
  Cast,
  Stakeholder,
  Director,
} from './identity';
import type { DocumentMeta } from './meta';
import { getAllAppsExcept } from './apps';
import { Organization } from './organisation';
import { Mandate } from './contract';

//////////////////
// MOVIE OBJECT //
//////////////////

/** Generic interface of a Movie */
export interface Movie {
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  app: Partial<{ [app in App]: MovieAppConfig }>; //! required
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
  expectedPremiere?: MovieExpectedPremiere;
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
  originalRelease?: MovieOriginalRelease[];
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
  campaignStarted: Date;

  //CATALOG specific
  delivery?: {
    file: StorageFile;
  };
}

export interface MovieVideos {
  screener?: MovieVideo; // Main screener
  publicScreener?: MovieVideo; // Public screener
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
export interface MovieAppConfig {
  acceptedAt: Date;
  submittedAt: Date;
  access: boolean;
  refusedAt: Date;
  status: StoreStatus;
}

export type MovieAppConfigRecord = Record<App, MovieAppConfig>;

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

export interface MovieOriginalRelease {
  date: Date;
  country: Territory;
  media?: ReleaseMedia;
}

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

export interface MovieShooting {
  dates?: MovieShootingDate;
  locations?: MovieShootingLocations[];
}

export interface MovieShootingLocations {
  cities?: string[];
  country?: Territory;
}

export interface MovieShootingDate {
  completed?: Date;
  progress?: Date;
  planned?: MoviePlannedShootingDateRange;
}

export type MovieNote = { firstName: string; lastName: string; role?: MovieNoteRole } & StorageFile;

export interface MoviePlannedShootingDateRange {
  from?: MoviePlannedShooting;
  to?: MoviePlannedShooting;
}

export interface MoviePlannedShooting {
  period?: ShootingPeriod;
  month?: string;
  year?: number;
}

export interface MovieExpectedPremiere {
  date?: Date;
  event?: string;
}

export interface MovieGoalsAudience {
  targets: string[];
  goals: SocialGoal[];
}

export interface SyncMovieAnalyticsOptions {
  filterBy: (movie: Movie) => boolean;
}

export interface CrmMovie extends Movie {
  org: Organization;
  screeningCount: number;
  releaseMedias: ReleaseMediaValue[];
  mandate: Mandate;
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
    keywords: params.keywords?.length ? params.keywords.map(kw => kw?.trim()) : [],
    app: createMovieAppConfig(params.app),
    expectedPremiere: createExpectedPremiere(params.expectedPremiere),
    campaignStarted: params.campaignStarted || null,
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

export function createMoviePromotional(params: Partial<MoviePromotionalElements> = {}): MoviePromotionalElements {
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

export function createLanguageKey(languages: LanguageRecord = {}): LanguageRecord {
  const languageSpecifications: LanguageRecord = {};
  for (const language in languages) {
    languageSpecifications[language] = createMovieLanguageSpecification(languages[language]);
  }
  return languageSpecifications;
}

export function createMovieLanguageSpecification(params: Partial<MovieLanguageSpecification> = {}): MovieLanguageSpecification {
  return {
    dubbed: false,
    subtitle: false,
    caption: false,
    ...params,
  };
}

export function createAppConfig(params: Partial<MovieAppConfig>): MovieAppConfig {
  return {
    status: 'draft',
    access: false,
    ...params,
    acceptedAt: params?.acceptedAt,
    refusedAt: params?.refusedAt,
    submittedAt: params?.submittedAt,
  };
}

export function createMovieAppConfig(_appAccess: Partial<{ [app in App]: MovieAppConfig }> = {}): MovieAppConfigRecord {
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

export function createMovieOriginalRelease(params: Partial<MovieOriginalRelease> = {}): MovieOriginalRelease {
  return {
    country: null,
    ...params,
    date: params.date,
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
    ...stakeholders,
  };
}

export function populateMovieLanguageSpecification(spec: LanguageRecord, slug: Language, type: MovieLanguageType, value = true) {
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

export function createExpectedPremiere(params: Partial<MovieExpectedPremiere> = {}): MovieExpectedPremiere {
  return {
    event: '',
    ...params,
    date: params.date,
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
    ...file,
    ...params,
  };
}

/**
 * Takes an array of movies and returns a list of their titles.
 * @param movies
 */
export function getMovieTitleList(movies: Movie[]): string[] {
  const movieTitles = movies.map(movie => (movie.title.international ? movie.title.international : movie.title.original));
  return movieTitles;
}

export function createMovieVideos(params: Partial<MovieVideos>): MovieVideos {
  return {
    ...params,
    screener: createMovieVideo(params?.screener),
    publicScreener: createMovieVideo(params?.publicScreener),
    salesPitch: createMovieVideo(params?.salesPitch),
    otherVideos: params?.otherVideos?.map(video => createMovieVideo(video)) || [],
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
    .filter(status => (app === 'catalog' ? status === 'released' : true))
    .map(s => s as ProductionStatus);
}

export function hasAppStatus(app: App, status: StoreStatus[]) {
  return (movie: Movie) => status.includes(movie.app[app].status);
}

/** Return an array of the app access of the movie */
export function getMovieAppAccess(movie: Movie): App[] {
  return app.filter((a) => !['crm'].includes(a) && movie.app[a].access);
}

/** Return true if the movie has the status passed in parameter for at least one application */
export function checkMovieStatus(movie: Movie, status: StoreStatus) {
  return Object.keys(movie.app).some((a) => movie.app[a].status === status);
}

export function isMovieAccepted(movie: Movie, app: App) {
  return isMovieInStatus('accepted', movie, app);
}

function isMovieInStatus(status: StoreStatus, movie: Movie, app: App) {
  return movie.app[app]?.status === status && movie.app[app]?.access;
}

/**
 * Return the last app where the movie was accepted on
 * @param movie 
 */
export function wasLastAcceptedOn(movie: Movie): App {
  const acceptedApps = app.map(a => isMovieInStatus('accepted', movie, a) ? a : '').filter(a => a);
  const movieAppConfig = acceptedApps.map(a => ({ ...movie.app[a], app: a } as MovieAppConfig & { app: App }));
  const lastAcceptedOn = movieAppConfig.sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime());
  return lastAcceptedOn.length ? lastAcceptedOn[0].app : getMovieAppAccess(movie)[0];
}

/**
 * Return the last app where the movie was submitted on
 * @param movie 
 */
export function wasLastSubmittedOn(movie: Movie): App {
  const submittedApps = app.map(a => isMovieInStatus('submitted', movie, a) ? a : '').filter(a => a);
  const movieAppConfig = submittedApps.map(a => ({ ...movie.app[a], app: a } as MovieAppConfig & { app: App }));
  const lastSubmittedOn = movieAppConfig.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return lastSubmittedOn.length ? lastSubmittedOn[0].app : getMovieAppAccess(movie)[0];
}

/**
 * Determine the status to update depending on the current app.
 * For app Festival, publish status is "accepted", "submitted" for other apps
 */
export function getMoviePublishStatus(a: App): StoreStatus {
  return a === 'festival' ? 'accepted' : 'submitted';
}
