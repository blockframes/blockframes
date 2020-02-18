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
import { RawRange, NumberRange } from "@blockframes/utils/common-interfaces/range";
import { Person, SalesAgent, Producer, Crew, Cast, Stakeholder } from "@blockframes/utils/common-interfaces/identity";
import { firestore } from "firebase/app";
import { ImgRef } from "@blockframes/utils/image-uploader";
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";

type Timestamp = firestore.Timestamp;

export const enum WorkType {
  movie = 'Movie',
  short = 'Short',
  serie = 'Serie',
  season = 'Season',
  volume = 'Volume',
  episode = 'Episode',
  collection = 'Collection',
  tv_film = 'TV Film',
  flow = 'Flow'
}

export const enum StoreType {
  library = 'Library',
  line_up = 'Line-Up',
}

export enum PremiereType {
  'international' = 'International',
  'world' = 'World',
  'market' = 'Market',
  'national' = 'National',
}

export enum UnitBox {
  boxoffice_dollar = 'Box office in $',
  boxoffice_euro = 'Box office in €',
  entrances = '#Entrances',
}

export const enum StoreStatus {
  submitted = 'Submitted',
  accepted = 'Accepted',
  draft = 'Draft',
  refused = 'Refused',
}

export interface EventAnalytics {
  event_date: string,
  event_name: AnalyticsEvents,
  hits: number,
  movieId: string
}

export interface MovieAnalytics {
  movieId: string,
  addedToWishlist: {
    current: EventAnalytics[],
    past: EventAnalytics[]
  },
  movieViews: {
    current: EventAnalytics[],
    past: EventAnalytics[]
  },
  promoReelOpened: {
    current: EventAnalytics[],
    past: EventAnalytics[]
  }
}

export interface StoreConfig {
  status: StoreStatus,
  storeType: StoreType,
}

interface MovieSalesAgentDealRaw<D> {
  rights: RawRange<D>;
  territories: TerritoriesSlug[],
  medias: MediasSlug[],
  salesAgent?: SalesAgent,
  reservedTerritories?: TerritoriesSlug[],
}

export interface MovieSalesAgentDealDocumentWithDates extends MovieSalesAgentDealRaw<Date> {
}

export interface MoviePromotionalDescription {
  keyAssets: string,
  keywords: string[],
}

export interface Prize {
  name: string,
  year: number,
  prize?: string,
  logo?: ImgRef,
  premiere?: PremiereType,
}

export interface PromotionalElement {
  label: string,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  media: ImgRef,
  language?: LanguagesSlug,
  country?: TerritoriesSlug,
}

export interface MoviePromotionalElements {
  trailer: PromotionalElement[],
  banner: PromotionalElement,
  poster: PromotionalElement[],
  still_photo: PromotionalElement[],
  presentation_deck: PromotionalElement,
  scenario: PromotionalElement,
  promo_reel_link: PromotionalElement,
  screener_link: PromotionalElement,
  trailer_link: PromotionalElement,
  teaser_link: PromotionalElement,
}

export interface Title {
  original: string;
  international?: string;
}

export interface MovieStory {
  synopsis: string,
  logline: string,
}

export interface MovieSalesCast {
  producers: Producer[],
  cast: Cast[],
  crew: Crew[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface BoxOffice {
  unit: UnitBox,
  value: number,
  territory: TerritoriesSlug,
}

export interface MovieBudget {
  totalBudget: string, // WIP #1052 use Price Interface?
  budgetCurrency?: string, // WIP #1052
  detailledBudget?: any, // WIP #1052
  estimatedBudget?: NumberRange,
  boxOffice?: BoxOffice[],
}

export const enum MovieLanguageTypes {
  original = 'original',
  dubbed = 'dubbed',
  subtitle = 'subtitle',
  caption = 'caption',
}

export interface MovieLanguageSpecification {
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
  caption: boolean;
}

export interface MovieOriginalReleaseRaw<D> {
  date: D | string;
  country: TerritoriesSlug;
  media?: MediasSlug
}

export interface MovieRating {
  country: TerritoriesSlug;
  reason?: string,
  system?: RatingSlug,
  value: string,
}

export type MovieLanguageSpecificationContainer = Record<LanguagesSlug, MovieLanguageSpecification>;

export interface MovieOfficialIds {
  isan: string;
  eidr: string;
  imdb?: string;
  custom?: string;
  internal?: string;
}

export interface MovieMain {
  internalRef?: string,
  isan?: string,
  title: Title,
  directors?: Person[],
  officialIds?: MovieOfficialIds,
  productionYear?: number,
  genres?: GenresSlug[],
  customGenres?: string[],
  originCountries?: TerritoriesSlug[],
  originalLanguages?: LanguagesSlug[],
  status?: MovieStatusSlug,
  stakeholders?: MovieStakeholders,
  shortSynopsis?: string,
  workType?: WorkType;
  storeConfig?: StoreConfig;
  totalRunTime?: number | string;
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
  releaseYear: number,
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
}

interface DocumentMeta {
  createdBy: string;
  updatedBy?: string,
  deletedBy?: string
}

/** Generic interface of a Movie */
interface MovieRaw<D> {
  _type: 'movies';
  _meta?: DocumentMeta;
  id: string;
  deliveryIds: string[];
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
  salesAgentDeal: MovieSalesAgentDealRaw<D>;
  budget: MovieBudget;
  movieReview: MovieReview[];
}

export interface MovieLegalDocuments {
  chainOfTitles: LegalDocument[],
}

export interface MovieVersionInfo {
  languages: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>;
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
