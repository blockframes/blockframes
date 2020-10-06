import {
  TerritoriesSlug,
  LanguagesSlug,
  MediasSlug,
  ScoringValues,
  CertificationsValues,
  ColorsValues,
  RatingValues,
  SoundFormatValues,
  MovieFormatQualityValues,
  MovieFormatValues,
  GenresSlug,
  ContentType,
  ProductionStatus,
  StoreStatus,
  StoreType,
  PremiereType,
  UnitBox,
  ShootingPeriod,
  MovieCurrenciesSlug,
  HostedVideoTypes
} from "@blockframes/utils/static-model";
import { NumberRange } from "@blockframes/utils/common-interfaces/range";
import { Producer, Crew, Cast, Stakeholder, Director, Person } from "@blockframes/utils/common-interfaces/identity";
import { firestore } from "firebase/app";
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";
import { MovieAppAccess } from "@blockframes/utils/apps";

// TODO issue#2582

//////////////////
// MOVIE OBJECT //
//////////////////

/** Generic interface of a Movie */
interface MovieRaw<D> {
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  documents: MovieLegalDocuments;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  audience?: MovieGoalsAudience,
  banner?: string;
  boxOffice?: BoxOffice[],
  cast?: Cast[],
  certifications?: CertificationsValues[],
  color?: ColorsValues,
  contentType: ContentType; //! required
  crew?: Crew[],
  directors: Director[], //! required
  estimatedBudget?: NumberRange,
  expectedPremiere?: MovieExpectedPremiereRaw<D>,
  format?: MovieFormatValues,
  formatQuality?: MovieFormatQualityValues,
  genres: GenresSlug[], //! required
  customGenres?: string[],
  internalRef?: string,
  isOriginalVersionAvailable: boolean;
  keyAssets?: string,
  keywords?: string[],
  languages?: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
  logline?: string,
  originalLanguages: LanguagesSlug[], //! required
  originalRelease?: MovieOriginalReleaseRaw<D>[],
  originCountries: TerritoriesSlug[], //! required
  poster?: string;
  prizes?: Prize[],
  customPrizes?: Prize[],
  producers?: Producer[],
  productionStatus?: ProductionStatus,
  rating?: MovieRating[],
  release: MovieRelease, //! required
  review?: MovieReview[],
  runningTime?: MovieRunningTime;
  scoring?: ScoringValues,
  shooting?: MovieShooting,
  soundFormat?: SoundFormatValues,
  stakeholders?: MovieStakeholders,
  storeConfig: StoreConfig, //! required
  synopsis: string, //! required
  title: Title, //! required
  totalBudget?: MovieTotalBudget,


  // New Data
  // financialCurrency: string,
  // returnInvestment: MovieReturnInvestment
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
  type?: HostedVideoTypes
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
  territory: TerritoriesSlug,
}

export interface MovieLanguageSpecification {
  // The original version is a gross version of the movie, without dubbed, subtitle, etc.
  // So for example if a movie has 2 original languages, we will hear the two languages in the movie, without dubbed for one of the language
  // In the form, we don't care of the language for the original version parameter.
  // If this version is available, so every languages registered in the originalLanguage field will have a `original: true` data here.
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
  caption: boolean;
}

export type MovieLanguageSpecificationContainer = Record<LanguagesSlug, MovieLanguageSpecification>;
export type LanguageRecord = Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;


export interface MovieOriginalReleaseRaw<D> {
  date: D;
  country: TerritoriesSlug;
  media?: MediasSlug
}

export interface MovieOriginalRelease extends MovieOriginalReleaseRaw<Date> {}

export interface MovieRating {
  country: TerritoriesSlug;
  reason?: string,
  system?: RatingValues,
  value: string,
}

export interface MovieReview {
  criticName?: string,
  journalName?: string,
  criticQuote?: string,
  revueLink?: string,
}

export interface DocumentMeta {
  createdBy: string;
  updatedBy?: string,
  deletedBy?: string
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
  time: number | string,
  status: string,
}

export interface OtherLink {
  name: string;
  url: string;
}

export interface MovieShootingRaw<D> {
  dates?: MovieShootingDateRaw<D>,
  locations?: MovieShootingLocations[]
}

export interface MovieShooting extends MovieShootingRaw<Date> {}

export interface MovieShootingLocations {
  city: string,
  country: TerritoriesSlug,
}

export interface MovieShootingDateRaw<D> {
  completed?: D
  progress?: D,
  planned?: MoviePlannedShootingDateRange
}

export interface MovieShootingDate extends MovieShootingDateRaw<Date> {}

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

export interface MovieExpectedPremiere extends MovieExpectedPremiereRaw<Date> {}

export interface MovieSalesPitch {
  description: string,
  file: string, // hosted media
}

export interface MovieGoalsAudience {
  targets: string[],
  goals: string[]
}

export interface MovieTotalBudget {
  castCost?: number,
  currency?: MovieCurrenciesSlug,
  others?: number,
  postProdCost?: number,
  producerFees?: number,
  shootCost?: number,
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
