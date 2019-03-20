export interface Movie {
  id: string,
  title: string[],
  ipId: string,
  credits: {firstName: string, lastName: string, creditRole: string}[],
  stakholders: {orgName: string, stakeholderRole:string}[],
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
    id: params.id || '',
    title: params.title || [],
    ipId: params.ipId,
    credits: params.credits || [],
    stakholders: params.stakholders || [],
    genres: params.genres || [],
    isan: params.isan,
    status: params.status,
    poster: params.poster,
    types: params.types || [],
    keywords: params.keywords || [],
    logline: params.logline,
    synopsis: params.synopsis,
    directorNote: params.directorNote,
    producerNote: params.producerNote,
    originCountry: params.originCountry,
    languages: params.languages || [],
    promotionalElements: params.promotionalElements || [],
    goalBudget: params.goalBudget,
    movieCurrency: params.movieCurrency,
    fundedBudget: params.fundedBudget,
    breakeven: params.breakeven,
    backendProfit: params.backendProfit,
    potentialRevenues: params.potentialRevenues,
    selectionCategories: params.selectionCategories,
  } : {} as Movie;
}
