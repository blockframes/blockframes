import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "../../stakeholder/+state";

export interface Movie {
  id: string,
  org?: Organization,
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
  collectionName: 'movies' | 'templates' | 'deliveries',
  materials?: Material[];
  stakeholders?: Stakeholder[];
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
    collectionName: 'movies'
  } as Movie;
}
