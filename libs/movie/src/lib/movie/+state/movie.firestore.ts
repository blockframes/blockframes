import {
  MovieStatusSlug,
  ResourceRatioSlug,
  ResourceSizesSlug,
  TerritoriesSlug,
  LanguagesSlug,
  MediasSlug,
  ScoringSlug,
  CertificationsSlug,
  ColorsSlug,
  RatingSlug,
  SoundFormatSlug,
  FormatQualitySlug,
  FormatSlug,
  GenresSlug
} from "@blockframes/utils/static-model";
import { NumberRange } from "@blockframes/utils/common-interfaces/range";
import { Producer, Crew, Cast, Stakeholder, Director } from "@blockframes/utils/common-interfaces/identity";
import { firestore } from "firebase/app";
import { ImgRef, HostedMedia, ExternalMedia } from "@blockframes/media/+state/media.firestore";
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";
import { Price } from "@blockframes/utils/common-interfaces";
import { MovieAppAccess } from "@blockframes/utils/apps";

// TODO issue#2582

//////////////////
// MOVIE OBJECT //
//////////////////

/** Generic interface of a Movie */
interface MovieRaw<D> {
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  documents: MovieLegalDocuments;

  // Sections
  budget: MovieBudget;
  festivalPrizes: MovieFestivalPrizes;
  main: MovieMain;
  movieReview: MovieReview[];
  production: MovieProduction;
  promotionalElements: MoviePromotionalElements;
  promotionalDescription: MoviePromotionalDescription;
  salesCast: MovieSalesCast;
  salesInfo: MovieSalesInfoRaw<D>;
  story: MovieStory;
  versionInfo: MovieVersionInfo;

  // TODO discuss of what is the better way to store the JWPlayer id with Bruce, François and Yohann
  // TODO we will need more visibility on the upload part to take the final decision
  // TODO we also need to consider how to differentiate full movies from trailer
  hostedVideo?: string;
}

interface NewMovie<D> {
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  documents: MovieLegalDocuments;

  // Every field concerning the movie
  banner: PromotionalImage;
  boxOffice?: BoxOffice[],
  cast: Cast[],
  certifications: CertificationsSlug[],
  color: ColorsSlug,
  contentType?: ContentType;
  crew: Crew[],
  customGenres?: string[],
  directors?: Director[], // TODO issue#3179
  estimatedBudget?: NumberRange,
  format?: FormatSlug,
  formatQuality?: FormatQualitySlug,
  genres?: GenresSlug[],
  hostedVideo?: string;
  internalRef?: string,
  keyAssets: string,
  keywords: string[],
  languages: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
  logline: string,
  originalLanguages?: LanguagesSlug[],
  originalRelease: MovieOriginalReleaseRaw<D>[],
  originCountries?: TerritoriesSlug[],
  poster: PromotionalImage;
  prizes: Prize[],
  producers: Producer[],
  rating: MovieRating[],
  releaseYear?: number,
  review: MovieReview[],
  scoring: ScoringSlug,
  soundFormat?: SoundFormatSlug,
  stakeholders?: MovieStakeholders,
  status?: MovieStatusSlug,
  storeConfig?: StoreConfig;
  synopsis: string,
  title: Title,
  totalBudget?: Price,
  totalRunTime?: number | string;

  // Only section left
  promotional: MoviePromotionalElements;
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

////////////////////
// MOVIE SECTIONS //
////////////////////

export interface MovieBudget {
  /**
   * @dev If the budget is fixed, we use totalBudget
   */
  totalBudget?: Price,
  /**
   * @dev If budget is not fixed, we can put an estimate with estimatedBudget.
   * @see BUDGET_LIST for possible values
   * */
  estimatedBudget?: NumberRange,
  /** @dev More information needed. What is this about ? */
  boxOffice?: BoxOffice[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface MovieMain {
  banner: PromotionalImage;
  contentType?: ContentType;
  customGenres?: string[],
  directors?: Director[], // TODO issue#3179
  genres?: GenresSlug[],
  internalRef?: string,
  originCountries?: TerritoriesSlug[],
  originalLanguages?: LanguagesSlug[],
  poster: PromotionalImage;
  releaseYear?: number,
  status?: MovieStatusSlug,
  storeConfig?: StoreConfig;
  title: Title,
  totalRunTime?: number | string;
}

export interface MovieReview {
  criticName?: string,
  criticQuote?: string,
  journalName?: string,
  revueLink?: string,
}

export interface MovieProduction {
  stakeholders?: MovieStakeholders,
}

export interface MoviePromotionalElements {
  presentation_deck: PromotionalHostedMedia,
  promo_reel_link: PromotionalExternalMedia,
  scenario: PromotionalHostedMedia,
  screener_link: PromotionalExternalMedia,
  still_photo: Record<string, PromotionalImage>,
  teaser_link: PromotionalExternalMedia,
  trailer_link: PromotionalExternalMedia,
}

export interface MoviePromotionalDescription {
  keyAssets: string,
  keywords: string[],
}

export interface MovieSalesCast {
  cast: Cast[],
  crew: Crew[],
  producers: Producer[],
}

interface MovieSalesInfoRaw<D> {
  certifications: CertificationsSlug[],
  color: ColorsSlug,
  format?: FormatSlug,
  formatQuality?: FormatQualitySlug,
  originalRelease: MovieOriginalReleaseRaw<D>[],
  rating: MovieRating[],
  scoring: ScoringSlug,
  soundFormat?: SoundFormatSlug,
}

export interface MovieSalesInfoDocumentWithDates extends MovieSalesInfoRaw<Date> {
}

export interface MovieStory {
  logline: string,
  synopsis: string,
}

export interface MovieVersionInfo {
  languages: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
}

////////////////////
// MOVIE DETAILS //
////////////////////

type Timestamp = firestore.Timestamp;

export const contentType = {
  feature_film: 'Feature Film',
  short: 'Short',
  serie: 'Serie',
  season: 'Season',
  volume: 'Volume',
  episode: 'Episode',
  collection: 'Collection',
  tv_film: 'TV Film',
  flow: 'Flow'
} as const;

export type ContentType = keyof typeof contentType;
export type ContentTypeValue = typeof contentType[ContentType];

export const storeType = {
  library: 'Library',
  line_up: 'Line-Up',
} as const;

export type StoreType = keyof typeof storeType;
export type StoreTypeValue = typeof storeType[StoreType];

export const premiereType = {
  international: 'International',
  world: 'World',
  market: 'Market',
  national: 'National',
} as const;

export type PremiereType = keyof typeof premiereType;
export type PremiereTypeValue = typeof premiereType[PremiereType];

export const unitBox = {
  boxoffice_dollar: 'Box Office in $',
  boxoffice_euro: 'Box Office in €',
  admissions: 'Admissions',
} as const;

export type UnitBox = keyof typeof unitBox;
export type UnitBoxValue = typeof unitBox[UnitBox];

export const storeStatus = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  draft: 'Draft',
  refused: 'Refused',
} as const;

export type StoreStatus = keyof typeof storeStatus;
export type StoreStatusValue = typeof storeStatus[StoreStatus];

export const movieLanguageTypes = {
  original: 'Original',
  dubbed: 'Dubbed',
  subtitle: 'Subtitle',
  caption: 'Caption',
} as const;

export type MovieLanguageTypes = keyof typeof movieLanguageTypes;
export type MovieLanguageTypesValue = typeof movieLanguageTypes[MovieLanguageTypes];

export interface StoreConfig {
  status: StoreStatus,
  storeType: StoreType,
  appAccess: MovieAppAccess
}

export interface Prize {
  name: string,
  year: number,
  prize?: string,
  logo?: ImgRef,
  premiere?: PremiereType,
}

export interface PromotionalElement {
  label: string;
}

export interface PromotionalExternalMedia extends PromotionalElement {
  media: ExternalMedia,
}

export interface PromotionalHostedMedia extends PromotionalElement {
  media: HostedMedia,
}

export interface PromotionalImage extends PromotionalElement {
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  media: ImgRef,
}

export interface Title {
  original: string;
  international?: string;
}

export interface BoxOffice {
  unit: UnitBox,
  value: number,
  territory: TerritoriesSlug,
}

export interface MovieLanguageSpecification {
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

export interface MovieOriginalRelease extends MovieOriginalReleaseRaw<Date> { }

export interface MovieRating {
  country: TerritoriesSlug;
  reason?: string,
  system?: RatingSlug,
  value: string,
}

export interface MovieMain {
  banner: PromotionalImage;
  contentType?: ContentType;
  customGenres?: string[],
  directors?: Director[], // TODO issue#3179
  genres?: GenresSlug[],
  internalRef?: string,
  originCountries?: TerritoriesSlug[],
  originalLanguages?: LanguagesSlug[],
  poster: PromotionalImage;
  releaseYear?: number,
  status?: MovieStatusSlug,
  storeConfig?: StoreConfig;
  title: Title,
  totalRunTime?: number | string;
}

export interface MovieProduction {
  stakeholders?: MovieStakeholders,
}

interface MovieSalesInfoRaw<D> {
  broadcasterCoproducers: string[],
  certifications: CertificationsSlug[],
  color: ColorsSlug,
  format?: FormatSlug,
  formatQuality?: FormatQualitySlug,
  originalRelease: MovieOriginalReleaseRaw<D>[],
  physicalHVRelease: D,
  rating: MovieRating[],
  scoring: ScoringSlug,
  soundFormat?: SoundFormatSlug,
}

export interface MovieSalesInfoDocumentWithDates extends MovieSalesInfoRaw<Date> {
}

export interface MovieOriginalRelease extends MovieOriginalReleaseRaw<Date> {
}

export interface MovieReview {
  criticName?: string,
  journalName?: string,
  criticQuote?: string,
  revueLink?: string,
  publicationDate?: Date;
}

export interface DocumentMeta {
  createdBy: string;
  updatedBy?: string,
  deletedBy?: string
}

/** Generic interface of a Movie */
interface MovieRaw<D> {
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  documents: MovieLegalDocuments;

  // Sections
  main: MovieMain;
  story: MovieStory;
  promotionalElements: MoviePromotionalElements;
  promotionalDescription: MoviePromotionalDescription;
  salesCast: MovieSalesCast;
  salesInfo: MovieSalesInfoRaw<D>;
  versionInfo: MovieVersionInfo;
  festivalPrizes: MovieFestivalPrizes;
  budget: MovieBudget;
  movieReview: MovieReview[];
  production: MovieProduction;

  // TODO discuss of what is the better way to store the JWPlayer id with Bruce, François and Yohann
  // TODO we will need more visibility on the upload part to take the final decision
  // TODO we also need to consider how to differentiate full movies from trailer
  hostedVideo?: string;
}

export interface MovieLegalDocuments {
  chainOfTitles: LegalDocument[],
}

export interface MovieStakeholders {
  executiveProducer: Stakeholder[];
  coProducer: Stakeholder[];
  broadcasterCoproducer: Stakeholder[];
  lineProducer: Stakeholder[];
  distributor: Stakeholder[];
  salesAgent: Stakeholder[];
  laboratory: Stakeholder[];
  financier: Stakeholder[];
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
