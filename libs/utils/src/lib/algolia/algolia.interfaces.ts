import { algolia } from '@env';
import {
    Territory,
    Genre,
    Language,
    StoreType,
    StoreStatus,
    ProductionStatus
} from '../static-model';
import { MovieRunningTime, MovieRelease, MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { Module } from '../apps';

/* TODO MF, REMOVE WHEN TRANSITION IS DONE */
import algoliasearch from 'algoliasearch'
export const searchClient = algoliasearch(algolia.appId, algolia.searchKey)

export interface AlgoliaConfig {
    searchableAttributes: string[];
    attributesForFaceting: string[];
}

export interface AlgoliaQuery<T> {
    text?: string;
    limitResultsTo: number;
    activePage: number;
    facets?: Partial<T>,
    filters?: MovieIndexFilters
}

export interface MovieIndexConfig {
    genres: Genre,
    languages: Partial<Record<keyof MovieLanguageSpecification, Language>>,
    originCountries: Territory,
    status: ProductionStatus,
    storeConfig: StoreStatus,
    storeType: StoreType,
}

export interface MovieIndexFilters {
    budget?: number,
    minPledge?: number
}

/** A simple map to access the index name */
export const algoliaIndex = {
    user: algolia.indexNameUsers,
    org: {
        financiers: algolia.indexNameOrganizations.financiers,
        festival: algolia.indexNameOrganizations.festival,
        catalog: algolia.indexNameOrganizations.catalog
    },
    movie: {
        financiers: algolia.indexNameMovies.financiers,
        catalog: algolia.indexNameMovies.catalog,
        festival: algolia.indexNameMovies.festival
    }
}

export type AlgoliaIndex = keyof typeof algoliaIndex;

///// TYPES //////

interface AlgoliaRecord {
    objectID: string,
}

export interface AlgoliaSearch {
    query: string;
    page: number;
    hitsPerPage: number;
}

/* MOVIE */

export interface AlgoliaRecordMovie extends AlgoliaRecord {
    title: {
        international: string,
        original: string
    },
    directors: string[],
    keywords: string[],
    genres: Genre[]
    originCountries: Territory[],
    languages: {
        original: Language[],
        dubbed: Language[],
        subtitle: Language[],
        caption: Language[]
    },
    status: ProductionStatus,
    storeConfig: StoreStatus,
    budget: number,
    orgName: string,
    poster: string,
    banner: string,
    originalLanguages: Language[],
    runningTime: MovieRunningTime,
    release: MovieRelease
    storeType: StoreType,
}

/* ORGANIZATION */

export interface AlgoliaRecordOrganization extends AlgoliaRecord {
    name: string,
    appModule: Module[],
    country: Territory,
    isAccepted: boolean,
    hasAcceptedMovies: boolean
}

/* USER */

export interface AlgoliaRecordUser extends AlgoliaRecord {
    email: string,
    firstName: string,
    lastName: string,
    avatar: string,
} 
