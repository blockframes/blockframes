import { SearchIndex } from 'algoliasearch';
import { AvailsFilter, AvailsFilterWithEncodedTerritories, CalendarAvailsFilter, MapAvailsFilter } from './avail';
import { MovieLanguageSpecification, MovieRunningTime, MovieRelease, LanguageVersion } from './movie';
import {
  Genre,
  Language,
  Territory,
  ProductionStatus,
  StoreStatus,
  OrgActivity,
  ContentType,
  Module,
  ModuleAccess,
  SocialGoal,
  Festival,
  Certification,
  modules,
  MovieSearchableElements,
  EncodedTerritory
} from './static';

export interface AlgoliaConfig {
  searchableAttributes: string[];
  attributesForFaceting: string[];
  customRanking?: string[];
  paginationLimitedTo: number;
  typoTolerance: boolean;
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

interface AlgoliaQuery<T, C = unknown> {
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
  orgNames: [string];
  orgIds: [string];
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

const negativeModules = ['-dashboard', '-marketplace'] as const;
const algoliaModules = [...modules, ...negativeModules];
export type AlgoliaModule = typeof algoliaModules[number];

///// TYPES //////
interface AlgoliaSearch {
  query: string;
  page: number;
  hitsPerPage: number;
}

export interface AlgoliaSearchQuery {
  hitsPerPage?: number;
  page?: number;
  query?: string;
  restrictSearchableAttributes?: MovieSearchableElements[];
  facetFilters?: string[][];
  filters?: string;
}

export interface AlgoliaResult<T> {
  hits: T[];
  nbHits: number;
}

export interface AlgoliaMinMax {
  min: number;
  max: number;
}

export interface MovieSearch extends AlgoliaSearch {
  storeStatus: StoreStatus[];
  genres: Genre[];
  originCountries: EncodedTerritory[];
  languages: LanguageVersion;
  productionStatus: ProductionStatus[];
  minBudget: number;
  releaseYear: AlgoliaMinMax;
  sellers: AlgoliaOrganization[];
  socialGoals: SocialGoal[];
  contentType?: ContentType;
  runningTime: AlgoliaMinMax;
  festivals: Festival[];
  certifications: Certification[];
  searchBy: MovieSearchableElements[];
}

export interface MovieAvailsSearch {
  search?: MovieSearch;
  avails?: AvailsFilter | CalendarAvailsFilter | MapAvailsFilter;
}

export interface MovieAvailsFilterSearch {
  search?: MovieSearch;
  avails?: AvailsFilter | AvailsFilterWithEncodedTerritories;
}

export interface OrganizationSearch extends AlgoliaSearch {
  appModule: AlgoliaModule[],
  isAccepted: boolean,
  hasAcceptedMovies: boolean,
  countries?: Territory[],
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
  orgIds: string[];
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


export async function recursiveSearch<T>(index: SearchIndex, _search: AlgoliaSearchQuery): Promise<AlgoliaResult<T>> {
  const search = { ..._search, hitsPerPage: 1000, page: 0 };
  const results = await index.search<T>(search.query, search);
  let hitsRetrieved: number = results.hits.length;
  const maxLoop = 10; // Security to prevent infinite loop
  let loops = 0;
  while (results.nbHits > hitsRetrieved) {
    loops++;
    search.page++;
    const m = await index.search<T>(search.query, search);
    results.hits = results.hits.concat(m.hits);
    hitsRetrieved = results.hits.length;
    if (loops >= maxLoop) break;
  }

  return { hits: results.hits, nbHits: results.nbHits };
}