import { algolia } from '@env';
import { Genre, Language, StoreType, Territory } from '../static-model';
import { Module } from '../apps';
import { MovieRunningTime, MovieRelease } from '@blockframes/movie/+state/movie.firestore';

export interface AlgoliaConfig {
    searchableAttributes: string[];
    attributesForFaceting: string[];
}

/** A simple map to access the index name */
export const algoliaIndex = {
    user: algolia.indexNameUsers,
    org: algolia.indexNameOrganizations,
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
    status: string,
    storeConfig: string,
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