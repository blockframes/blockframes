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
import { firestore } from "firebase/app";
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";
import { MovieAppAccess } from "@blockframes/utils/apps";
import { DocumentMeta } from "@blockframes/utils/models-meta";

// TODO issue#2582

//////////////////
// MOVIE OBJECT //
//////////////////

/** Generic interface of a Movie */
interface MovieRaw<D> {
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta<D>;
  id: string;
  documents: MovieLegalDocuments;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  audience?: MovieGoalsAudience,
  banner?: string;
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
  poster?: string;
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
export interface MovieDocument extends MovieRaw<Timestamp> {
}

/** Document model of a Movie with Dates (type Date) */
export interface MovieDocumentWithDates extends MovieRaw<Date> {
}

/** Public interface of a movie (to notifications). */
export interface PublicMovie {
  id: string;
  title: Title;
}

export interface HostedVideos {
  screener?: HostedVideo; // Main screener
  otherVideos?: HostedVideo[]; // Other videos
}

export interface HostedVideo {
  ref: string,
  jwPlayerId: string,
  title?: string,
  description?: string,
  type?: HostedVideoType
}

////////////////////
// MOVIE SECTIONS //
////////////////////

export interface MoviePromotionalElements {

  financialDetails: string,
  moodboard: string,
  notes: MovieNote[],
  presentation_deck: string,
  salesPitch: MovieSalesPitch,
  scenario: string,
  still_photo: string[],
  videos?: HostedVideos,

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

type Timestamp = firestore.Timestamp;

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
}

export interface BoxOffice {
  unit: UnitBox,
  value?: number,
  territory: Territory,
}

export interface MovieLanguageSpecification {
  original: boolean; // @TODO this should be removed ( use isOriginalVersionAvailable instead )
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

export interface MovieLegalDocuments {
  chainOfTitles: LegalDocument[],
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

export interface MovieNote extends Person {
  ref: string,
}

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

export interface MovieSalesPitch {
  description?: string,
  ref?: string, // hosted media
  jwPlayerId?: string;
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

export interface MovieAnalytics {
  movieId: string,
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
