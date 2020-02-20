import {
  MovieBudget,
  MovieFestivalPrizes,
  MovieMain,
  MoviePromotionalDescription,
  MoviePromotionalElements,
  MovieReview,
  MovieSalesAgentDealDocumentWithDates as MovieSalesAgentDeal,
  MovieSalesCast,
  MovieSalesInfoDocumentWithDates as MovieSalesInfo,
  MovieStory,
  Prize,
  PromotionalElement,
  Title,
  WorkType,
  MovieLanguageSpecification,
  MovieLanguageTypes,
  StoreConfig,
  StoreType,
  MovieLanguageSpecificationContainer,
  MovieOfficialIds,
  MovieOriginalRelease,
  MovieRating,
  MovieDocumentWithDates,
  BoxOffice,
  UnitBox,
  MovieStakeholders,
  StoreStatus,
  MovieAnalytics,
  MovieLegalDocuments,
  DocumentMeta
} from './movie.firestore';
import { createImgRef } from '@blockframes/utils/image-uploader';
import { LanguagesSlug } from '@blockframes/utils/static-model';
import { createRange } from '@blockframes/utils/common-interfaces/range';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { Contract, getValidatedContracts } from '@blockframes/contract/contract/+state/contract.model';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { toDate } from '@blockframes/utils';

// Export for other files
export { Credit, SalesAgent } from '@blockframes/utils/common-interfaces/identity';
export {
  PromotionalElement,
  MovieBudget,
  MovieFestivalPrizes,
  MovieMain,
  MoviePromotionalDescription,
  MoviePromotionalElements,
  MovieSalesCast,
  MovieStory,
  MovieVersionInfo,
  MovieStakeholders,
  Prize,
  MovieSalesInfoDocumentWithDates as MovieSalesInfo,
  MovieSalesAgentDealDocumentWithDates as MovieSalesAgentDeal,
  MovieAnalytics,
  MovieReview
} from './movie.firestore';

export interface Movie extends MovieDocumentWithDates {
  distributionDeals?: DistributionDeal[]
}

/** A factory function that creates Movie */
export function createMovie(params: Partial<Movie> = {}): Movie {
  return {
    id: params.id,
    deliveryIds: [],
    _type: 'movies',
    documents: createMovieLegalDocuments(params.documents),
    versionInfo: { languages: {} }, // TODO issue #1596
    movieReview: [],
    ...params,
    main: createMovieMain(params.main),
    story: createMovieStory(params.story),
    promotionalElements: createMoviePromotionalElements(params.promotionalElements),
    promotionalDescription: createMoviePromotionalDescription(params.promotionalDescription),
    salesCast: createMovieSalesCast(params.salesCast),
    salesInfo: createMovieSalesInfo(params.salesInfo),
    festivalPrizes: createMovieFestivalPrizes(params.festivalPrizes),
    salesAgentDeal: createMovieSalesAgentDeal(params.salesAgentDeal),
    budget: createMovieBudget(params.budget),
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
    workType: WorkType.movie,
    originalLanguages: [],
    originCountries: [],
    status: null,
    customGenres: [],
    ...params,
    storeConfig: createStoreConfig(params.storeConfig),
    stakeholders: createMovieStakeholders(params.stakeholders),
    officialIds: createOfficialIds(params.officialIds),
  };
}

export function createMoviePromotionalElements(
  params: Partial<MoviePromotionalElements> = {},
  initDefault: boolean = true
): MoviePromotionalElements {
  const elements = {
    trailer: [],
    still_photo: [],
    ...params,
    poster: params.poster && params.poster.length ? params.poster : [],
    banner: createPromotionalElement(params.banner),
    presentation_deck: createPromotionalElement(params.presentation_deck),
    scenario: createPromotionalElement(params.scenario),
    promo_reel_link: createPromotionalElement(params.promo_reel_link),
    screener_link: createPromotionalElement(params.screener_link),
    trailer_link: createPromotionalElement(params.trailer_link),
    teaser_link: createPromotionalElement(params.teaser_link),
  };

  // We want a default poster as we look for the first one
  if (initDefault && (!params.poster || params.poster.length === 0)) {
    elements.poster.push(createPromotionalElement());
  }

  return elements;
}

export function createMoviePromotionalDescription(
  params: Partial<MoviePromotionalDescription> = {}
): MoviePromotionalDescription {
  return {
    keyAssets: '',
    keywords: [],
    ...params
  };
}

export function createPromotionalElement(
  promotionalElement: Partial<PromotionalElement> = {}
): PromotionalElement {
  return {
    label: '',
    ...promotionalElement,
    media: createImgRef(promotionalElement.media)
  };
}

export function createMovieSalesCast(params: Partial<MovieSalesCast> = {}): MovieSalesCast {
  return {
    producers: [],
    cast: [],
    crew: [],
    ...params
  };
}

export function createMovieOriginalRelease(
  params: Partial<MovieOriginalRelease> = {}
): MovieOriginalRelease {
  return {
    country: null,
    ...params,
    date: toDate(params.date),
  };
}

export function createMovieRating(params: Partial<MovieRating> = {}): MovieRating {
  return {
    country: null,
    value: '',
    ...params
  };
}

export function createMovieSalesInfo(params: Partial<MovieSalesInfo> = {}): MovieSalesInfo {
  return {
    certifications: [],
    broadcasterCoproducers: [],
    scoring: null,
    color: null,
    rating: [],
    originalRelease: [],
    format: null,
    formatQuality: null,
    soundFormat: '',
    physicalHVRelease: null,
    releaseYear: null,
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

export function createBoxOffice(params: Partial<BoxOffice> = {}): BoxOffice {
  return {
    unit: UnitBox.boxoffice_dollar,
    value: 0,
    territory: null,
    ...params,
  }
}

export function createMovieBudget(params: Partial<MovieBudget> = {}): MovieBudget {
  return {
    totalBudget: '',
    boxOffice: [],
    ...params,
    estimatedBudget: createRange<number>(params.estimatedBudget),
  };
}

export function createMovieReview(params: Partial<MovieReview> = {}): MovieReview {
  return {
    criticName: '',
    journalName: '',
    criticQuote: '',
    revueLink: '',
    ...params,
  };
}

export function createMovieLanguageSpecification(
  params: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    caption: false,
    ...params
  };
}

export function populateMovieLanguageSpecification(
  spec: Partial<MovieLanguageSpecificationContainer>,
  slug: LanguagesSlug,
  type: MovieLanguageTypes,
  value: boolean = true
) {
  if (!spec[slug]) {
    spec[slug] = createMovieLanguageSpecification();
  }

  spec[slug][type] = value;
  return spec;
}

export function createStoreConfig(params: Partial<StoreConfig> = {}): StoreConfig {
  return {
    status: StoreStatus.draft,
    storeType: StoreType.line_up,
    ...params
  };
}

export function createOfficialIds(params: Partial<MovieOfficialIds> = {}): MovieOfficialIds {
  return {
    eidr: '',
    isan: '',
    ...params
  };
}

export function createMovieLanguage(
  movieLanguage: Partial<MovieLanguageSpecification> = {}
): MovieLanguageSpecification {
  return {
    original: false,
    dubbed: false,
    subtitle: false,
    ...movieLanguage
  } as MovieLanguageSpecification;
}

export function createMovieStakeholders(stakeholders: Partial<MovieStakeholders> = {}): MovieStakeholders {
  return {
    executiveProducer: [],
    coProducer: [],
    broadcasterCoproducer: [],
    lineProducer: [],
    distributor: [],
    salesAgent: [],
    laboratory: [],
    financier: [],
    ...stakeholders
  }
}

export function createMovieLegalDocuments(
  params: Partial<MovieLegalDocuments> = {}
): MovieLegalDocuments {
  return {
    chainOfTitles: [],
    ...params
  }
}

export function createDocumentMeta(meta: Partial<DocumentMeta> = {}): DocumentMeta {
  return {
    createdBy: '',
    ...meta
  }
}

/**
 * Takes an array of movies and returns a list of their titles.
 * @param movies
 */
export function getMovieTitleList(movies: Movie[]): string[] {
  const movieTitles = movies.map(movie => movie.main.title.international
    ? movie.main.title.international
    : movie.main.title.original
  )
  return movieTitles;
}

/**
 * Returns the total gross receipts of a movie from the contracts.
 * @param contracts
 * @param movieId
 */
export function getMovieReceipt(contracts: Contract[], movieId: string): number {
  const sales = getValidatedContracts(contracts);
  return sales.reduce((sum, contract) => sum + getContractLastVersion(contract).titles[movieId].price.amount, 0);
}

/**
 * Returns the number of views of a movie page.
 * @param analytics
 * @param movieId
 */
export function getMovieTotalViews(analytics: MovieAnalytics[], movieId: string): number {
  const movieAnalytic = analytics.find(analytic => analytic.movieId === movieId);
  const movieHits = movieAnalytic.movieViews.current.map(event => event.hits);
  return movieHits.reduce((sum, val) => sum + val, 0);
}
