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
  ScreeningStatus
} from "@blockframes/utils/static-model/types";
import { Producer, Crew, Cast, Stakeholder, Director } from "@blockframes/utils/common-interfaces/identity";
import type firebase from 'firebase';
import { AnalyticsEvents, AnalyticsBase } from '@blockframes/utils/analytics/analytics-model';
import { App } from "@blockframes/utils/apps";
import { DocumentMeta } from "@blockframes/utils/models-meta";
import { StorageFile, StorageVideo } from "@blockframes/media/+state/media.firestore";

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
  app: Partial<{ [app in App]: MovieAppConfig<D> }>, //! required
  audience?: MovieGoalsAudience,
  banner?: StorageFile;
  boxOffice?: BoxOffice[],
  cast?: Cast[],
  certifications?: Certification[],
  color?: Color,
  contentType: ContentType; //! required
  crew?: Crew[],
  directors: Director[], //! required
  estimatedBudget?: NumberRange,
  expectedPremiere?: MovieExpectedPremiereRaw<D>,
  format?: MovieFormat,
  formatQuality?: MovieFormatQuality,
  genres: Genre[], //! required
  customGenres?: string[],
  internalRef?: string,
  isOriginalVersionAvailable: boolean;
  keyAssets?: string,
  keywords?: string[],
  languages?: LanguageRecord;
  logline?: string,
  originalLanguages: Language[], //! required
  originalRelease?: MovieOriginalReleaseRaw<D>[],
  originCountries: Territory[], //! required
  poster?: StorageFile;
  prizes?: Prize[],
  customPrizes?: Prize[],
  producers?: Producer[],
  productionStatus?: ProductionStatus,
  rating?: MovieRating[],
  release: MovieRelease, //! required
  review?: MovieReview[],
  runningTime?: MovieRunningTime;
  scoring?: Scoring,
  shooting?: MovieShooting,
  soundFormat?: SoundFormat,
  stakeholders?: MovieStakeholders,
  synopsis: string, //! required
  title: Title, //! required
  orgIds: string[] //! required
  campaignStarted: D,

  //CATALOG specific
  delivery?: {
    file: StorageFile,
  }
}

/** Document model of a Movie */
export type MovieDocument = MovieBase<Timestamp>

export interface MovieVideos {
  screener?: MovieVideo; // Main screener
  salesPitch?: MovieVideo; // Sales pitch
  otherVideos?: MovieVideo[]; // Other videos
}

export interface MovieVideo extends StorageVideo {
  title?: string,
  description?: string,
  type?: HostedVideoType
}

////////////////////
// MOVIE SECTIONS //
////////////////////

export interface MoviePromotionalElements {
  moodboard: StorageFile,
  notes: MovieNote[],
  presentation_deck: StorageFile,
  scenario: StorageFile,
  still_photo: StorageFile[],
  videos?: MovieVideos,
}

////////////////////
// MOVIE DETAILS //
////////////////////

type Timestamp = firebase.firestore.Timestamp;

export interface MovieAppConfig<D> {
  acceptedAt: D,
  access: boolean,
  refusedAt: D,
  status: StoreStatus
}

export type MovieAppConfigRecord = Record<App, MovieAppConfig<Date>>;

export interface Prize {
  name: string,
  year?: number,
  prize?: string,
  logo?: string,
  premiere?: PremiereType,
}

export interface Title {
  original: string;
  international?: string;
  series?: number;
}

export interface BoxOffice {
  unit: UnitBox,
  value?: number,
  territory: Territory,
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
  media?: MediaValue
}

export type MovieOriginalRelease = MovieOriginalReleaseRaw<Date>

export interface MovieRating {
  country: Territory;
  reason?: string,
  system?: Rating,
  value: string,
}

export interface MovieReview {
  criticName?: string,
  journalName?: string,
  criticQuote?: string,
  revueLink?: string,
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
  year?: number,
  status: ScreeningStatus
}

export interface MovieRunningTime {
  time?: number,
  status?: ScreeningStatus,
  episodeCount?: number
}

export interface MovieShootingRaw<D> {
  dates?: MovieShootingDateRaw<D>,
  locations?: MovieShootingLocations[]
}

export type MovieShooting = MovieShootingRaw<Date>

export interface MovieShootingLocations {
  cities?: string[],
  country?: Territory,
}

export interface MovieShootingDateRaw<D> {
  completed?: D
  progress?: D,
  planned?: MoviePlannedShootingDateRange
}

export type MovieShootingDate = MovieShootingDateRaw<Date>

export type MovieNote = { firstName: string, lastName: string, role: string } & StorageFile;

export interface MoviePlannedShootingDateRange {
  from?: MoviePlannedShooting,
  to?: MoviePlannedShooting
}

export interface MoviePlannedShooting {
  period?: ShootingPeriod,
  month?: string,
  year?: number
}

export interface MovieExpectedPremiereRaw<D> {
  date?: D,
  event?: string
}

export type MovieExpectedPremiere = MovieExpectedPremiereRaw<Date>

export interface MovieGoalsAudience {
  targets: string[],
  goals: SocialGoal[]
}


/////////////////////
// MOVIE ANALYTICS //
/////////////////////

export interface MovieEventAnalytics {
  event_date: string,
  event_name: AnalyticsEvents,
  hits: number,
  movieId: string
}

export interface MovieAnalytics extends AnalyticsBase {
  addedToWishlist: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  },
  movieViews: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  },
  promoReelOpened: {
    current: MovieEventAnalytics[],
    past: MovieEventAnalytics[]
  }
}
