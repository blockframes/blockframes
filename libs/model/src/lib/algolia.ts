import { MovieLanguageSpecification, MovieRunningTime, MovieRelease } from './movie';
import {
  Genre,
  Language,
  Territory,
  ProductionStatus,
  StoreStatus,
  OrgActivity,
  ContentType,
  Module,
  ModuleAccess
} from './static';

export interface AlgoliaConfig {
  searchableAttributes: string[];
  attributesForFaceting: string[];
  customRanking?: string[];
  paginationLimitedTo: number;
}

export interface AlgoliaQueries {
  user: AlgoliaQuery<UserIndexConfig, unknown>;
  movie: AlgoliaQuery<MovieIndexConfig, MovieIndexFilters>;
  org: AlgoliaQuery<OrganizationIndexConfig, unknown>;
}
export interface AlgoliaObject {
  user: AlgoliaUser;
  movie: AlgoliaMovie;
  org: AlgoliaOrganization;
}

export interface AlgoliaQuery<T, C = unknown> {
  text?: string;
  limitResultsTo: number;
  activePage: number;
  facets?: Partial<T>;
  filters?: Partial<C>;
}

interface MovieIndexConfig {
  genres: Genre;
  languages: Partial<Record<keyof MovieLanguageSpecification, Language>>;
  originCountries: Territory;
  status: ProductionStatus;
  storeStatus: StoreStatus;
}

interface OrganizationIndexConfig {
  appModule: ModuleAccess;
  name: string;
  country: Territory;
  isAccepted: boolean;
  hasAcceptedMovies: boolean;
  activity: OrgActivity;
}

interface UserIndexConfig {
  email: string;
  firstName: string;
  lastName: string;
}
export interface MovieIndexFilters {
  budget?: number;
  minPledge?: number;
}

///// TYPES //////

export interface AlgoliaSearch {
  query: string;
  page: number;
  hitsPerPage: number;
}

interface AlgoliaDefaultProperty {
  objectID: string;
}

/* MOVIE */

export interface AlgoliaMovie extends AlgoliaDefaultProperty {
  title: {
    international: string;
    original: string;
  };
  directors: string[];
  keywords: string[];
  genres: Genre[];
  originCountries: Territory[];
  languages: {
    original: Language[];
    dubbed: Language[];
    subtitle: Language[];
    caption: Language[];
  };
  status: ProductionStatus | string;
  storeStatus: StoreStatus | string;
  budget: number;
  orgNames: string[];
  poster: string;
  banner: string;
  originalLanguages: Language[];
  runningTime: MovieRunningTime;
  release: MovieRelease;
  contentType: ContentType;
  festivals: string[];
  productionCompany: string[];
  salesAgent: string[];
  certifications: string[];
}

/* ORGANIZATION */

export interface AlgoliaOrganization extends AlgoliaDefaultProperty {
  name: string;
  appModule: Module[];
  country: Territory;
  isAccepted: boolean;
  hasAcceptedMovies: boolean;
  logo: string;
  activity: OrgActivity;
}

/* USER */

export interface AlgoliaUser extends AlgoliaDefaultProperty {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  orgName: string;
}
