import { Movie } from '@blockframes/movie/+state';
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { InjectionToken } from '@angular/core';
import { GetKeys, Language, SocialGoal, Territory } from './static-model';
import { FormList, Validator } from './form';
import { FormControl } from '@angular/forms';
import { ProductionStatus } from './static-model';
import { App, Module } from './apps';
import { MovieRunningTime, MovieRelease } from '@blockframes/movie/+state/movie.firestore';

// @ts-ignore
export const searchClient = algoliasearch(algolia.appId, algolia.searchKey);

/** An Organization search result coming from Algolia */
export interface OrganizationAlgoliaResult {
  name: string;
  objectID: string;
}

/**
 * An Interface for movie search result from Algolia
 */
export interface MovieAlgoliaResult {
  objectID: string;
  movie: Movie;
}


/** A simple map to access the index name */
export const algoliaIndex = {
  user: algolia.indexNameUsers,
  org: algolia.indexNameOrganizations,
  movie: {
    financiers: algolia.indexNameMovies.financiers,
    catalog: algolia.indexNameMovies.catalog ,
    festival: algolia.indexNameMovies.festival
  }
}

export type AlgoliaIndex = keyof typeof algoliaIndex;

///// TYPES //////

export interface AlgoliaUser {
  email: string,
  firstName: string,
  lastName: string,
  avatar: string,
  objectID: string
}

/**
 * Create a FormList that create user with mail if no user exist
 * It's used by algolia-chips-autocomplete components to enter mail that have no user for example
 */
export function createAlgoliaUserForm(validators?: Validator) {
  const createAlogliaUser = (user: (string | Partial<AlgoliaUser>)) => {
    return typeof user === 'string' ? { email: user } : user;
  }
  const factory = user => new FormControl(createAlogliaUser(user));
  return FormList.factory<AlgoliaUser, FormControl>([], factory, validators)
}

export interface AlgoliaOrg {
  name: string,
  objectID: string
}

export interface AlgoliaMovie {
  title: {
    international: string,
    original: string
  },
  directors: string[],
  keywords: string[],
  genres: GetKeys<'genres'>[],
  originCountries: Territory[],
  languages: {
    original: GetKeys<'languages'>[],
    dubbed: GetKeys<'languages'>[],
    subtitle: GetKeys<'languages'>[],
    caption: GetKeys<'languages'>[]
  },
  status: ProductionStatus,
  budget: number,
  orgName: string,
  storeType: GetKeys<'storeType'>,
  objectID: string
}

export interface AlgoliaSearch {
  query: string;
  page: number;
  hitsPerPage: number;
}

interface AlgoliaRecord {
  objectID: string,
}
export interface AlgoliaRecordOrganization extends AlgoliaRecord {
  name: string,
  appAccess: App[],
  appModule: Module[],
  country: Territory
}

export interface AlgoliaRecordMovie extends AlgoliaRecord {
  title: {
    international: string,
    original: string,
  },
  directors: string[],
  keywords: string[],
  genres: string[],
  originCountries: string[],
  languages: {
    original: string[],
    dubbed: string[],
    subtitle: string[],
    caption: string[],
  },
  status: string,
  storeConfig: string,
  budget: number,
  orgName: string,
  storeType: string,
  poster: string,
  banner: string,
  originalLanguages: Language[],
  runningTime: MovieRunningTime,
  release: MovieRelease
}

export interface AlgoliaRecordUser extends AlgoliaRecord {
  email: string,
  firstName: string,
  lastName: string,
  avatar: string,
}
