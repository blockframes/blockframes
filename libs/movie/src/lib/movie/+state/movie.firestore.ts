import { DateRangeRaw } from "@blockframes/utils/date-range";
import { firestore } from "firebase/app";
import { PromotionalElementTypesSlug, ResourceSizesSlug, ResourceRatioSlug, MovieStatusSlug } from "@blockframes/movie/movie/static-model";

type Timestamp = firestore.Timestamp;

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

interface MovieSalesAgentDealRaw<D> {
  rights: DateRangeRaw<D>;
  territories: string[],
  medias: string[],
  salesAgent?: Person,
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
}

export interface PromotionalElement {
  label: string,
  type: PromotionalElementTypesSlug,
  size?: ResourceSizesSlug,
  ratio?: ResourceRatioSlug,
  url: string
}

export interface MoviePromotionalElements {
  images: string[], // @todo #1052 merge into promotional elements
  promotionalElements: PromotionalElement[],
}

export interface Title {
  original: string;
  international?: string;
}

export interface Person {
  firstName: string, // @todo #1052 replace with displayName
  lastName?: string, // @todo #1052 replace with displayName
  creditRole?: string, // @todo #1052 rename to role
  displayName?: string, // @todo #1052 "?" is temporary
  showName?: boolean, // @todo #1052 merge credit & stakeholder interface ? or implements?
  orgId?: string, // @todo #1052 merge credit & stakeholder interface ? or implements?
  logo?: string,
}

export interface MovieStory {
  synopsis: string,
  logline: string,
}

export interface MovieSalesCast {
  credits: Person[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface MovieBudget {
  totalBudget: string, // WIP #1052 use Price Interface?
  budgetCurrency?: string, // WIP #1052
  detailledBudget?: any // WIP #1052
}

interface MovieSaleRaw<D> {
  operatorName: string;
  showOperatorName: boolean; //@todo #581 Promotional Distribution Deal
  rights: DateRangeRaw<D>;
  territories: string[];
  medias: string[];
  dubbings: string[];
  subtitles: string[];
  exclusive: boolean;
  price: number;
}

export interface MovieSaleDocumentWithDates extends MovieSaleRaw<Date> {
}

export interface MovieMain {
  internalRef?: string,
  isan?: string,
  title: Title,
  directors?: Person[],
  poster?: string,
  productionYear?: number,
  genres?: string[],
  originCountries?: string[],
  languages?: string[],
  status?: MovieStatusSlug,
  productionCompanies?: Person[],
  length?: number,
  shortSynopsis?: string,
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
