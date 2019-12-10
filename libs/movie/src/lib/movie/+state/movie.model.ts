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
  Prize,
  PromotionalElement,
  Title,
  LicenseStatus,
  HoldbackWithDates,
  WorkType,
  FormatProfile
} from './movie.firestore';
import { createImgRef } from '@blockframes/utils/image-uploader';
import { createStakeholder, Credit, SalesAgent, Licensee, Licensor } from '@blockframes/utils/common-interfaces/identity';
import { createPrice } from '@blockframes/utils/common-interfaces/price';
import { createTerms } from '@blockframes/utils/common-interfaces/terms';

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

export type SalesAgent = SalesAgent;

export type Licensee = Licensee;

export type Licensor = Licensor;

export type DistributionDeal = DistributionDealDocumentWithDates;

export type MovieSalesInfo = MovieSalesInfoDocumentWithDates;

export type MovieSalesAgentDeal = MovieSalesAgentDealDocumentWithDates;

export type Movie = MovieDocumentWithDates;

export type Holdback = HoldbackWithDates;

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

// @TODO #1052 remove this section .
// merge movie.promotionalElements.promotionalElements and movie.promotionalElements.images  into `movie.promotionalElements`
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
    id: '',
    licensee: createStakeholder(),
    licensor: createStakeholder(),
    licenseStatus: LicenseStatus.unknown,
    licenseType: [],
    terms: createTerms(),

    territories: [],
    dubbings: {},
    subtitles: [],

    workType: WorkType.movie,
    exclusive: false,
    price: createPrice(),
    titleInternalAlias: '',
    formatProfile: FormatProfile.unknown,
    download: false,
    holdbacks: [],
    fees: [],
    ...params
  };
}

export function createMovieBudget(params: Partial<MovieBudget> = {}): MovieBudget {
  return {
    totalBudget: '',
    ...params
  };
}

export function createHoldback(params: Partial<Holdback> = {}): Holdback {
  return {
    terms: createTerms(),
    media: '',
    ...params
  };
}
