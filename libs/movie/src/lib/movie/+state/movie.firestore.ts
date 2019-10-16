import { DateRangeRaw } from "@blockframes/utils/date-range";
import { firestore } from "firebase/app";

type Timestamp = firestore.Timestamp;

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

interface MovieSalesAgentDealRaw<D> {
  rights: DateRangeRaw<D>;
  territories: string[],
  medias: string[],
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
  url: string
}

export interface MoviePromotionalElements {
  images: string[],
  promotionalElements: PromotionalElement[],
}

export interface Title {
  original: string;
  international?: string;
}

export interface Credit {
  firstName: string,
  lastName?: string,
  creditRole?: string,
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
  directors?: Credit[],
  poster?: string,
  productionYear?: number,
  genres?: string[],
  originCountries?: string[],
  languages?: string[],
  status?: string,
  productionCompanies?: Credit[],
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
  goalBudget?: number;
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
