import { Organization } from "@blockframes/organization";
import { Material } from "@blockframes/material";
import { Stakeholder } from "./../../stakeholder/+state";

export interface Movie {
  id: string,
  title: any, // will contain all titles: original, international, suiss, etc
  directorName: string,
  productionYear: number,
  org?: Organization,
  ipId: string,
  credits: {firstName: string, lastName: string, creditRole: string}[],
  genres: string[],
  isan: number,
  status: string,
  poster: string,
  types: string[],
  keywords: string[],
  logline: string,
  synopsis: string,
  directorNote: string,
  producerNote: string,
  originCountry: string,
  languages: string[],
  promotionalElements: {promotionalElementName: string, url: string}[],
  goalBudget: number,
  movieCurrency: string,
  fundedBudget: number,
  breakeven: number,
  backendProfit: number,
  potentialRevenues: number,
  selectionCategories: string,
  materials?: Material[];
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params?: Partial<Movie>) {
  return {
    ...params,
  } as Movie;
}
