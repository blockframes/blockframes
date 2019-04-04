export interface Movie {
  id: string,
  title: string[],
  ipId: string,
  credits: {firstName: string, lastName: string, creditRole: string}[],
  stakeholderIds: string[],
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
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params?: Partial<Movie>) {
  return params ? {
    stakeholderIds: [],
    ...params,
  } : {} as Movie;
}
