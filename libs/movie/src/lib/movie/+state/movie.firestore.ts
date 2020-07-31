import {
  MovieStatusSlug,
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
  GenresSlug,
} from "@blockframes/utils/static-model";
import { NumberRange } from "@blockframes/utils/common-interfaces/range";
import { Producer, Crew, Cast, Stakeholder, Director } from "@blockframes/utils/common-interfaces/identity";
import { firestore } from "firebase/app";
import { HostedMedia, ExternalMedia } from "@blockframes/media/+state/media.firestore";
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
  // Every field concerning the document
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  documents: MovieLegalDocuments;

  // Only section left
  promotional: MoviePromotionalElements;

  // Every field concerning the movie
  banner?: PromotionalHostedMedia;
  boxOffice?: BoxOffice[],
  cast?: Cast[],
  certifications?: CertificationsSlug[],
  color?: ColorsSlug,
  contentType: ContentType; //! required
  crew?: Crew[],
  customGenres?: string[],
  directors: Director[], //! required
  estimatedBudget?: NumberRange,
  format?: FormatSlug,
  formatQuality?: FormatQualitySlug,
  genres: GenresSlug[], //! required
  // TODO discuss of what is the better way to store the JWPlayer id with Bruce, François and Yohann
  // TODO we will need more visibility on the upload part to take the final decision
  // TODO we also need to consider how to differentiate full movies from trailer
  hostedVideo?: string;
  internalRef?: string,
  keyAssets?: string,
  keywords?: string[],
  languages?: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
  logline?: string,
  originalLanguages: LanguagesSlug[], //! required
  originalRelease?: MovieOriginalReleaseRaw<D>[],
  originCountries: TerritoriesSlug[], //! required
  poster?: PromotionalHostedMedia;
  prizes?: Prize[],
  producers?: Producer[],
  productionStatus?: MovieStatusSlug,
  rating?: MovieRating[],
  release: MovieRelease, //! required
  review?: MovieReview[],
  runningTime?: MovieRunningTime;
  scoring?: ScoringSlug,
  soundFormat?: SoundFormatSlug,
  stakeholders?: MovieStakeholders,
  storeConfig: StoreConfig, //! required
  synopsis: string, //! required
  title: Title, //! required
  totalBudget?: Price,
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

export interface MoviePromotionalElements {
  presentation_deck: PromotionalHostedMedia,
  promo_reel_link: PromotionalExternalMedia,
  scenario: PromotionalHostedMedia,
  screener_link: PromotionalExternalMedia,
  still_photo: Record<string, PromotionalHostedMedia>,
  teaser_link: PromotionalExternalMedia,
  trailer_link: PromotionalExternalMedia,
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
  logo?: HostedMedia,
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

export interface MovieOriginalRelease extends MovieOriginalReleaseRaw<Date> {}

export interface MovieRating {
  country: TerritoriesSlug;
  reason?: string,
  system?: RatingSlug,
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
  executiveProducer: Stakeholder[];
  coProducer: Stakeholder[];
  broadcasterCoproducer: Stakeholder[];
  lineProducer: Stakeholder[];
  distributor: Stakeholder[];
  salesAgent: Stakeholder[];
  laboratory: Stakeholder[];
  financier: Stakeholder[];
}

export interface MovieRelease {
  year: number,
  status: string,
}

export interface MovieRunningTime {
  time: number,
  status: string,
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
