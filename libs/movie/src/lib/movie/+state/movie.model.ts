import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "../../stakeholder/+state";
import { DateRange } from "@blockframes/utils";

export interface MovieSale {
  operatorName: string;
  showOperatorName: boolean; //@todo #581 Promotional Distribution Deal
  rights: DateRange;
  territories: string[];
  medias: string[];
  dubbings: string[];
  subtitles: string[];
  exclusive: boolean;
  price: number;
}

export interface Title {
  original: string;
  international?: string;
}

export interface Prize {
  name: string,
  year: number,
  prize?: string,
}

export interface Credit {
  firstName: string,
  lastName?: string,
  creditRole?: string,
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

export interface PromotionalElement {
  label: string,
  url: string
}

export interface MoviePromotionalElements {
  images: string[],
  promotionalElements: PromotionalElement[],
}

export interface MoviePromotionalDescription {
  keyAssets: string[],
  keywords: string[],
}

export interface MovieSalesCast {
  credits: Credit[],
}

export interface MovieStory {
  synopsis: string,
  logline: string,
}

export interface MovieSalesInfo {
  scoring: string,
  color: string,
  europeanQualification: boolean,
  pegi: string,
  certifications: string[],
  internationalPremiere: Prize,
  originCountryReleaseDate: Date,
  broadcasterCoproducers: string[],
}

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

export interface MovieFestivalPrizes {
  prizes: Prize[]
}

export interface MovieSalesAgentDeal {
  rights: DateRange;
  territories: string[],
  medias: string[],
}

export interface Movie {
   // @todo #643 add new fields to Draw.io
  _type: 'movies',
  id: string,
  organization?: Organization,
  materials?: Material[];
  stakeholders?: Stakeholder[];
  sales: MovieSale[], //@todo 581 => move to subcollection

  // @todo #643 not main movie attributes WIP

  ipId: string,
  directorNote: string,
  producerNote: string,
  goalBudget: number,
  movieCurrency: string,
  fundedBudget: number,
  breakeven: number,
  backendProfit: number,
  potentialRevenues: number,
  selectionCategories: string,
  deliveryIds: string[],


  // Sections
  main : MovieMain,
  story: MovieStory,
  promotionalElements: MoviePromotionalElements,
  promotionalDescription: MoviePromotionalDescription,
  salesCast: MovieSalesCast,
  salesInfo: MovieSalesInfo,
  versionInfo: MovieVersionInfo,
  festivalPrizes: MovieFestivalPrizes,
  salesAgentDeal: MovieSalesAgentDeal,
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params: Partial<Movie> = {}) : Movie {
  return {
    deliveryIds: [],
    _type: 'movies',
    main: {},
    story: {},
    promotionalElements: {},
    promotionalDescription: {},
    salesCast: {},
    salesInfo: {},
    versionInfo: {},
    festivalPrizes: {},
    salesAgentDeal: {},
    sales: [],
    ... params
  } as Movie;
}


export function createMovieMain(params : Partial<MovieMain> = {}) : MovieMain{
  return {
    title: {
      original: '',
      international: '',
    },
    directors: [],
    genres: [],
    languages: [],
    productionCompanies: [],
    originCountries: [],
    ... params
  } as MovieMain;
}

export function createMoviePromotionalElements(params : Partial<MoviePromotionalElements> = {}) : MoviePromotionalElements{
  return {
    images: [],
    promotionalElements: [],
    ... params
  } as MoviePromotionalElements;
}

export function createMoviePromotionalDescription(params : Partial<MoviePromotionalDescription> = {}) : MoviePromotionalDescription{
  return {
    keyAssets: [],
    keywords: [],
    ... params
  } as MoviePromotionalDescription;
}

export interface PromotionalElement {
  label: string,
  url: string
}

export function createPromotionalElement(promotionalElement: Partial<PromotionalElement> = {}): PromotionalElement {
  return {
    label: '',
    url: '',
    ...promotionalElement
  }
}

export function createMovieSalesCast(params : Partial<MovieSalesCast> = {}) : MovieSalesCast{
  return {
    credits: [],
    ... params
  } as MovieSalesCast;
}

export function createMovieSalesInfo(params : Partial<MovieSalesInfo> = {}) : MovieSalesInfo{
  return {
    internationalPremiere: {
      name: '',
      year: '',
      prize: '',
    },
    certifications: [],
    broadcasterCoproducers: [],
    ... params
  } as MovieSalesInfo;
}

export function createMovieStory(params : Partial<MovieStory> = {}) : MovieStory{
  return {
    ... params
  } as MovieStory;
}

export function createMovieVersionInfo(params : Partial<MovieVersionInfo> = {}) : MovieVersionInfo{
  return {
    dubbings: [],
    subtitles: [],
    ... params
  } as MovieVersionInfo;
}

export function createMovieFestivalPrizes(params : Partial<MovieFestivalPrizes> = {}) : MovieFestivalPrizes{
  return {
    prizes: [],
    ... params
  } as MovieFestivalPrizes;
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    ...prize
  }
}

export function createRights(rights: Partial<DateRange> = {}): DateRange {
  return {
    from: null,
    to: null,
    ...rights
  }
}

export function createMovieSalesAgentDeal(params : Partial<MovieSalesAgentDeal> = {}) : MovieSalesAgentDeal{
  return {
    rights: {
      from: '',
      to: '',
    },
    territories: [],
    medias: [],
    ... params
  } as MovieSalesAgentDeal;
}

export function createMovieSale(params : Partial<MovieSale> = {}) : MovieSale{
  return {
    rights: {
      from: '',
      to: '',
    },
    territories: [],
    medias: [],
    dubbings: [],
    subtitles: [],
    ... params
  } as MovieSale;
}

export function createCredit(params : Partial<Credit> = {}) : Credit {
  return {
    firstName: '',
    lastName: '',
    creditRole: '',
    ... params
  } as Credit;
}
