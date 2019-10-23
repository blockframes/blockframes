import {
  MovieDocumentWithDates,
  MovieMain,
  MoviePromotionalElements,
  MoviePromotionalDescription,
  MovieSalesCast,
  MovieStory,
  MovieVersionInfo,
  MovieFestivalPrizes,
  Prize,
  Title,
  Credit,
  MovieSaleDocumentWithDates,
  MovieSalesAgentDealDocumentWithDates,
  MovieSalesInfoDocumentWithDates,
  PromotionalElement
} from './movie.firestore';

export type PromotionalElement = PromotionalElement;

export type MovieFestivalPrizes = MovieFestivalPrizes;

export type MovieMain = MovieMain;

export type MoviePromotionalDescription = MoviePromotionalDescription;

export type MoviePromotionalElements = MoviePromotionalElements;

export type MovieSalesCast = MovieSalesCast;

export type MovieStory = MovieStory;

export type MovieVersionInfo = MovieVersionInfo;

export type Prize = Prize;

export type Credit = Credit;

export type MovieSale = MovieSaleDocumentWithDates;

export type MovieSalesInfo = MovieSalesInfoDocumentWithDates;

export type MovieSalesAgentDeal = MovieSalesAgentDealDocumentWithDates;

export type Movie = MovieDocumentWithDates;

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    deliveryIds: [],
    _type: 'movies',
    main: createMovieMain(params.main),
    story: createMovieStory(params.story),
    promotionalElements: createMoviePromotionalElements(params.promotionalElements),
    promotionalDescription: createMoviePromotionalDescription(params.promotionalDescription),
    salesCast: createMovieSalesCast(params.salesCast),
    salesInfo: createMovieSalesInfo(params.salesInfo),
    versionInfo: createMovieVersionInfo(params.versionInfo),
    festivalPrizes: createMovieFestivalPrizes(params.festivalPrizes),
    salesAgentDeal: createMovieSalesAgentDeal(params.salesAgentDeal),
    ...params
  };
}

/** A factory function that creates MovieMain */
export function createMovieMain(params: Partial<MovieMain> = {}): MovieMain {
  return {
    title: {
      original: '',
      international: ''
    },
    directors: [],
    genres: [],
    languages: [],
    productionCompanies: [],
    originCountries: [],
    ...params
  } as MovieMain;
}

export function createMoviePromotionalElements(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {
  return {
    images: [],
    promotionalElements: [],
    ...params
  } as MoviePromotionalElements;
}

export function createMoviePromotionalDescription(
  params: Partial<MoviePromotionalDescription> = {}
): MoviePromotionalDescription {
  return {
    keyAssets: [],
    keywords: [],
    ...params
  } as MoviePromotionalDescription;
}

export function createPromotionalElement(
  promotionalElement: Partial<PromotionalElement> = {}
): PromotionalElement {
  return {
    label: '',
    url: '',
    ...promotionalElement
  };
}

export function createMovieSalesCast(params: Partial<MovieSalesCast> = {}): MovieSalesCast {
  return {
    credits: [],
    ...params
  } as MovieSalesCast;
}

export function createMovieSalesInfo(params: Partial<MovieSalesInfo> = {}): MovieSalesInfo {
  return {
    internationalPremiere: {
      name: '',
      year: '',
      prize: ''
    },
    certifications: [],
    broadcasterCoproducers: [],
    ...params
  } as MovieSalesInfo;
}

export function createMovieStory(params: Partial<MovieStory> = {}): MovieStory {
  return {
    synopsis: '',
    logline: '',
    ...params
  } as MovieStory;
}

export function createMovieVersionInfo(params: Partial<MovieVersionInfo> = {}): MovieVersionInfo {
  return {
    dubbings: [],
    subtitles: [],
    ...params
  } as MovieVersionInfo;
}

export function createMovieFestivalPrizes(
  params: Partial<MovieFestivalPrizes> = {}
): MovieFestivalPrizes {
  return {
    prizes: [],
    ...params
  } as MovieFestivalPrizes;
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    ...prize
  };
}

export function createTitle(title: Partial<Title> = {}): Title {
  return {
    original: '',
    international: '',
    ...title
  };
}

export function createMovieSalesAgentDeal(
  params: Partial<MovieSalesAgentDeal> = {}
): MovieSalesAgentDeal {
  return {
    rights: {
      from: '',
      to: ''
    },
    territories: [],
    medias: [],
    ...params
  } as MovieSalesAgentDeal;
}

export function createMovieSale(params: Partial<MovieSale> = {}): MovieSale {
  return {
    rights: {
      from: '',
      to: ''
    },
    territories: [],
    medias: [],
    dubbings: [],
    subtitles: [],
    ...params
  } as MovieSale;
}

export function createCredit(params: Partial<Credit> = {}): Credit {
  return {
    firstName: '',
    lastName: '',
    creditRole: '',
    ...params
  } as Credit;
}
