import { MovieStatusSlug, PromotionalElementTypesSlug, ResourceRatioSlug, ResourceSizesSlug, TerritoriesSlug, LanguagesSlug, MediasSlug } from "@blockframes/movie/movie/static-model";
import { DateRangeRaw } from "@blockframes/utils/common-interfaces/date-range";
import { Person, Credit, SalesAgent, Company } from "@blockframes/utils/common-interfaces/identity";
import { firestore } from "firebase/app";
import { ImgRef } from "@blockframes/utils/image-uploader";
import { TermsRaw } from "@blockframes/utils/common-interfaces/terms";

type Timestamp = firestore.Timestamp;

export const enum LicenseStatus {
  unknown = 'unknown',
  undernegotiation = 'under negotiation',
  waitingsignature = 'waiting for signature',
  waitingpaiment = 'waiting for paiment',
  paid = 'paid',
}

export const enum WorkType {
  movie = 'Movie',
  short = 'Short',
  serie = 'Serie',
  season = 'Season',
  volume = 'Volume',
  episode = 'Episode',
  collection = 'Collection',
}

export const enum StoreType {
  tv = 'TV',
  movie = 'Movie',
}

export const enum FormatProfile {
  unknown = 'unknown',
  HD = 'HD',
  SD = 'SD',
  UHD = 'UHD',
  _3D = '3D',
  _3DSD = '3DSD',
  _3DHD = '3DHD',
  _3UHD = '3DUHD'
}

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

export interface StoreConfig {
  display: boolean,
  storeType: StoreType,
}

interface MovieSalesAgentDealRaw<D> {
  rights: DateRangeRaw<D>;
  territories: string[],
  medias: string[],
  salesAgent?: SalesAgent,
  reservedTerritories?: string[],
}

export interface MovieSalesAgentDealDocumentWithDates extends MovieSalesAgentDealRaw<Date> {
}

export interface MoviePromotionalDescription {
  keyAssets: string[],
  keywords: string[],
}

export interface Prize {
  name: string,
  year: number,
  prize?: string,
  logo?: ImgRef,
}

export interface PromotionalElement {
  label: string,
  type: PromotionalElementTypesSlug,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  media: ImgRef
}

export interface MoviePromotionalElements {
  images: ImgRef[], // @todo #1052 merge into promotional elements
  promotionalElements: PromotionalElement[],
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
  credits: Credit[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface MovieBudget {
  totalBudget: string, // WIP #1052 use Price Interface?
  budgetCurrency?: string, // WIP #1052
  detailledBudget?: any // WIP #1052
}

export const enum MovieLanguageTypes {
  original = 'original',
  dubbed = 'dubbed',
  subtitle = 'subtitle',
}

export interface MovieLanguageSpecification {
  original: boolean;
  dubbed: boolean;
  subtitle: boolean;
}

export interface HoldbackRaw<D> {
  terms: TermsRaw<D>,
  media: MediasSlug,
}

export interface HoldbackWithDates extends HoldbackRaw<Date> {
}

// Distribution deal raw interface, formerly called MovieSaleRaw
interface DistributionDealRaw<D> {
  id: string,
  publicId?: string,
  licenseType: MediasSlug[];
  terms: TermsRaw<D>;
  territory: TerritoriesSlug[];
  territoryExcluded : TerritoriesSlug[];
  assetLanguage: { [language in LanguagesSlug]: MovieLanguageSpecification };
  exclusive: boolean;
  titleInternalAlias: string;
  formatProfile: FormatProfile;
  download: boolean;
  contractId?: string;
  licenseStatus: LicenseStatus;
  reportingId?: string;
  deliveryIds?: string;
  multidiffusion?: number;
  holdbacks?:  HoldbackRaw<D>[];
  catchUp?: TermsRaw<D>;
}

export interface DistributionDealDocumentWithDates extends DistributionDealRaw<Date> {
}

export interface DistributionDealDocument extends DistributionDealRaw<Timestamp> {
}

export interface MovieMain {
  internalRef?: string,
  isan?: string,
  title: Title,
  directors?: Person[],
  poster?: ImgRef,
  productionYear?: number,
  genres?: string[],
  originCountries?: string[],
  languages?: string[],
  status?: MovieStatusSlug,
  productionCompanies?: Company[],
  shortSynopsis?: string,
  workType?: WorkType;
  storeConfig?: StoreConfig;
  totalRunTime?: number;
}

interface MovieSalesInfoRaw<D> {
  scoring: string,
  color: string,
  europeanQualification: boolean,
  pegi: string,
  certifications: string[],
  internationalPremiere: Prize,
  originCountryReleaseDate: D,
  broadcasterCoproducers: string[],
  theatricalRelease: boolean,
}

export interface MovieSalesInfoDocumentWithDates extends MovieSalesInfoRaw<Date> {
}

/** Generic interface of a Movie */
interface MovieRaw<D> {
  // @todo #643 add new fields to Draw.io
  _type: 'movies';
  id: string;

  // @todo #643 not main movie attributes WIP
  deliveryIds: string[];
  ipId?: string;
  directorNote?: string;
  producerNote?: string;
  goalBudget?: number; // @todo #1052 remove ?
  movieCurrency?: string;
  fundedBudget?: number;
  breakeven?: number;
  backendProfit?: number;
  potentialRevenues?: number;
  selectionCategories?: string;

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
