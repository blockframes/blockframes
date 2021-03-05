import {
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
  StoreType,
  PremiereType,
  UnitBox,
  ShootingPeriod,
  HostedVideoType,
  Territory,
  SocialGoal
} from "@blockframes/utils/static-model";
import { NumberRange } from "@blockframes/utils/static-model/types";
import { Producer, Crew, Cast, Stakeholder, Director, Person } from "@blockframes/utils/common-interfaces/identity";
import type firebase from 'firebase';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analytics-model';
import { MovieAppAccess } from "@blockframes/utils/apps";
import { DocumentMeta } from "@blockframes/utils/models-meta";
import { AnalyticsBase } from '@blockframes/utils/analytics/analytics-model';
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
  languages?: Partial<{ [language in Language]: MovieLanguageSpecification }>;
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
  storeConfig: StoreConfig, //! required
  synopsis: string, //! required
  title: Title, //! required
  orgIds: string[] //! required
  campaignStarted: D
}

/** Document model of a Movie */
export interface MovieDocument extends MovieBase<Timestamp> {
}

/** Public interface of a movie (to notifications). */
export interface PublicMovie {
  id: string;
  title: Title;
}

export interface MovieVideos {
  screener?: MovieVideo; // Main screener
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

  financialDetails: StorageFile,
  moodboard: StorageFile,
  notes: MovieNote[],
  presentation_deck: StorageFile,
  salesPitch: MovieSalesPitch,
  scenario: StorageFile,
  still_photo: StorageFile[],
  videos?: MovieVideos,

  // @TODO #2586 remove this when we can upload
  // videos through movie tunnel and remove the component for external links
  // + migration for cleaning
  clip_link: string,
  promo_reel_link: string,
  screener_link: string,
  teaser_link: string,
  trailer_link: string,
  other_links: OtherLink[],
}

////////////////////
// MOVIE DETAILS //
////////////////////

type Timestamp = firebase.firestore.Timestamp;

export interface StoreConfig {
  status: StoreStatus,
  storeType: StoreType,
  appAccess: MovieAppAccess
}

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

export type MovieLanguageSpecificationContainer = Record<Language, MovieLanguageSpecification>;
export type LanguageRecord = Partial<{ [language in Language]: MovieLanguageSpecification }>;


export interface MovieOriginalReleaseRaw<D> {
  date: D;
  country: Territory;
  media?: MediaValue
}

export interface MovieOriginalRelease extends MovieOriginalReleaseRaw<Date> { }

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
  status: string,
}

export interface MovieRunningTime {
  time?: number,
  status?: string,
  episodeCount?: number
}

export interface OtherLink {
  name: string;
  url: string;
}

export interface MovieShootingRaw<D> {
  dates?: MovieShootingDateRaw<D>,
  locations?: MovieShootingLocations[]
}

export interface MovieShooting extends MovieShootingRaw<Date> { }

export interface MovieShootingLocations {
  cities?: string[],
  country?: Territory,
}

export interface MovieShootingDateRaw<D> {
  completed?: D
  progress?: D,
  planned?: MoviePlannedShootingDateRange
}

export interface MovieShootingDate extends MovieShootingDateRaw<Date> { }

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

export interface MovieExpectedPremiere extends MovieExpectedPremiereRaw<Date> { }

export interface MovieSalesPitch extends StorageVideo {
  description?: string,
}

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
