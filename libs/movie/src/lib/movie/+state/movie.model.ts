import {
  MovieBudget,
  MovieDocumentWithDates,
  MovieFestivalPrizes,
  MovieMain,
  MoviePromotionalDescription,
  MoviePromotionalElements,
  DistributionDealDocumentWithDates,
  MovieSalesAgentDealDocumentWithDates,
  MovieSalesCast,
  MovieSalesInfoDocumentWithDates,
  MovieStory,
  MovieVersionInfo,
  Person,
  Prize,
  PromotionalElement,
  Title
} from './movie.firestore';
import { createImgRef } from '@blockframes/utils/image-uploader';

export type PromotionalElement = PromotionalElement;

export type MovieFestivalPrizes = MovieFestivalPrizes;

export type MovieMain = MovieMain;

export type MoviePromotionalDescription = MoviePromotionalDescription;

export type MoviePromotionalElements = MoviePromotionalElements;

export type MovieSalesCast = MovieSalesCast;

export type MovieStory = MovieStory;

export type MovieVersionInfo = MovieVersionInfo;

export type Prize = Prize;

export type Credit = Person;

export type SalesAgent = Person;

export type DistributionDeal = DistributionDealDocumentWithDates;

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
    budget: createMovieBudget(params.budget),
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
    status: '',
    ...params
  };
}

export function createMoviePromotionalElements(
  params: Partial<MoviePromotionalElements> = {}
): MoviePromotionalElements {
  return {
    images: [],
    promotionalElements: [],
    ...params
  };
}

export function createMoviePromotionalDescription(
  params: Partial<MoviePromotionalDescription> = {}
): MoviePromotionalDescription {
  return {
    keyAssets: [],
    keywords: [],
    ...params
  };
}

export function createPromotionalElement(
  promotionalElement: Partial<PromotionalElement> = {}
): PromotionalElement {
  return {
    label: '',
    media: createImgRef(promotionalElement.media),
    type: 'other',
    ...promotionalElement
  };
}

export function createMovieSalesCast(params: Partial<MovieSalesCast> = {}): MovieSalesCast {
  return {
    credits: [],
    ...params
  };
}

export function createMovieSalesInfo(params: Partial<MovieSalesInfo> = {}): MovieSalesInfo {
  return {
    internationalPremiere: {
      name: '',
      year: 0,
      prize: ''
    },
    certifications: [],
    broadcasterCoproducers: [],
    scoring: '',
    color: '',
    europeanQualification: false,
    pegi: '',
    originCountryReleaseDate: null,
    theatricalRelease: false,
    ...params
  };
}

export function createMovieStory(params: Partial<MovieStory> = {}): MovieStory {
  return {
    synopsis: '',
    logline: '',
    ...params
  };
}

export function createMovieVersionInfo(params: Partial<MovieVersionInfo> = {}): MovieVersionInfo {
  return {
    dubbings: [],
    subtitles: [],
    ...params
  };
}

export function createMovieFestivalPrizes(
  params: Partial<MovieFestivalPrizes> = {}
): MovieFestivalPrizes {
  return {
    prizes: [],
    ...params
  };
}

export function createPrize(prize: Partial<Prize> = {}): Prize {
  return {
    name: '',
    year: null,
    prize: '',
    logo: createImgRef(),
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
      from: null,
      to: null
    },
    territories: [],
    medias: [],
    reservedTerritories: [],
    ...params
  };
}

export function createDistributionDeal(params: Partial<DistributionDeal> = {}): DistributionDeal {
  return {
    operatorName: '',
    showOperatorName: false,
    rights: {
      from: null,
      to: null
    },
    territories: [],
    medias: [],
    dubbings: [],
    subtitles: [],
    exclusive: false,
    price: 0,
    ...params
  };
}

export function createCredit(params: Partial<Credit> = {}): Credit {
  return {
    firstName: '',
    lastName: '',
    creditRole: '',
    logo: createImgRef(),
    ...params
  };
}

export function createMovieBudget(params: Partial<MovieBudget> = {}): MovieBudget {
  return {
    totalBudget: '',
    ...params
  };
}
