import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "../../stakeholder/+state";

export interface MovieAvailability { //@todo rename into movieSales
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

export interface Credit {
  firstName: string,
  lastName: string,
  creditRole?: string,
}

export interface MovieMain {
  internalRef?: string,
  title: Title,
  directors?: Credit[],
  poster?: string,
  productionYear?: number,
  genres?: string[],
  originCountry?: string,
  languages?: string[],
  status?: string,
  //@todo #643 missing productionCompanies & length
}

export interface Movie {
  _type: 'movies',
  id: string,
  organization?: Organization,


  logline: string,
  synopsis: string,
  keywords: string[],
  credits: {firstName: string, lastName: string, creditRole: string}[],
  images: string[],
  promotionalElements: {label: string, url: string}[],
  materials?: Material[];
  stakeholders?: Stakeholder[];
  availabilities: MovieAvailability[],

  // @todo add new fields to Draw.io

  scoring: string,
  isan: string,
  length: number,
  productionCompanies: string[],
  broadcasterCoproducers: string[],
  color: string;
  certifications: string[],
  pegi: string,
  internationalPremiere: { name: string, year: number},
  originCountryReleaseDate: Date,
  prizes: {name: string, year: string, prize: string}[]
  keyAssets: string[],
  dubbings: string[],
  subtitles: string[],

  // not main movie attributes WIP
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
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params?: Partial<Movie>) {
  return {
    deliveryIds: [],
    _type: 'movies',
    ...params
  } as Movie;
}
