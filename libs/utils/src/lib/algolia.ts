import { Movie } from '@blockframes/movie/movie/+state';
import { algolia } from '@env';
import algoliasearch from 'algoliasearch/lite';
import { Index } from 'algoliasearch';
import { InjectionToken } from '@angular/core';

// @ts-ignore
const searchClient: SearchClient = algoliasearch(algolia.appId, algolia.searchKey);

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
