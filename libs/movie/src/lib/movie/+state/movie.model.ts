import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "../../stakeholder/+state";

export interface MovieAvailability {
  movieId? : string;
  movie?: Partial<Movie>
  territories: string[];
  rights: string[];
  start: Date;
  end: Date;
  languages?: string[];
  exclusivity: boolean;
}

export interface Movie {
  _type: 'movies',
  id: string,
  organization?: Organization,
  title: Title, // will contain all titles: original, international, suiss, etc
  directorName: string,
  poster: string,
  productionYear: number,
  types: string[],
  genres: string[],
  originCountry: string,
  coProducerCountries: string[],
  languages: string[],
  status: string,
  logline: string,
  synopsis: string,
  keywords: string[],
  credits: {firstName: string, lastName: string, creditRole: string}[],
  images: string[],
  promotionalElements: {label: string, url: string}[],
  materials?: Material[];
  stakeholders?: Stakeholder[];
  availabilities: MovieAvailability[],

  // not main movie attributes WIP
  ipId: string,
  isan: number,
  directorNote: string,
  producerNote: string,
  goalBudget: number,
  movieCurrency: string,
  fundedBudget: number,
  breakeven: number,
  backendProfit: number,
  potentialRevenues: number,
  selectionCategories: string,

}

interface Title {
  original: string;
  international?: string;
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params?: Partial<Movie>) {
  return {
    ...params,
    _type: 'movies'
  } as Movie;
}
