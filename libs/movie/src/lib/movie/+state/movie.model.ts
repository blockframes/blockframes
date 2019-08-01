import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "../../stakeholder/+state";

export interface MovieAvailability { //@todo #643 rename into movieSales
  movieId? : string;
  movie?: Partial<Movie>
  territories: string[];
  rights: string[];
  start: Date;
  end: Date;
  languages?: string[];
  exclusivity: boolean;
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
  originCountry?: string,
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
}

export interface MovieVersionInfo {
  dubbings: string[],
  subtitles: string[],
}

export interface Movie {
   // @todo #643 add new fields to Draw.io
  _type: 'movies',
  id: string,
  organization?: Organization,
  materials?: Material[];
  stakeholders?: Stakeholder[];
  availabilities: MovieAvailability[],

  // @todo #643 not main movie attributes WIP
  
  broadcasterCoproducers: string[],
  prizes: {name: string, year: string, prize: string}[]
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
