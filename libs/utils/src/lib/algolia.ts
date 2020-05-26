import { Movie } from '@blockframes/movie/+state';
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { InjectionToken } from '@angular/core';
import { ExtractSlug } from './static-model/staticModels';
import { FormList, Validator } from './form';
import { FormControl } from '@angular/forms';

// @ts-ignore
export const searchClient = algoliasearch(algolia.appId, algolia.searchKey);

export const OrganizationsIndex = new InjectionToken<Index>(
  'Algolia index to search organizations',
  {
    providedIn: 'root',
    factory: () => searchClient.initIndex(algolia.indexNameOrganizations)
  }
);

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

export const MoviesIndex = new InjectionToken<Index>('Algolia index to search movies', {
  providedIn: 'root',
  factory: () => searchClient.initIndex(algolia.indexNameMovies)
});


/** A simple map to access the index name */
export const algoliaIndex = {
  user: algolia.indexNameUsers,
  org: algolia.indexNameOrganizations,
  movie: algolia.indexNameMovies,
}

export type AlgoliaIndex = keyof typeof algoliaIndex;
export type GetAlgoliaSchema<I extends AlgoliaIndex> =
  I extends 'user' ? AlgoliaUser
  : I extends 'org' ? AlgoliaOrg
  : I extends 'movie' ? AlgoliaMovie
  : never;


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
  genres: ExtractSlug<'GENRES'>[],
  originCountries: ExtractSlug<'TERRITORIES'>[],
  languages: {
    original: ExtractSlug<'LANGUAGES'>[],
    dubbed: ExtractSlug<'LANGUAGES'>[],
    subtitle: ExtractSlug<'LANGUAGES'>[],
    caption: ExtractSlug<'LANGUAGES'>[]
  },
  status: ExtractSlug<'MOVIE_STATUS'>,
  budget: number,
  orgName: string,
  storeType: ExtractSlug<'STORE_TYPE'>,
  objectID: string
}


