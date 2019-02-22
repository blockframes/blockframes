import { ID } from '@datorama/akita';

export interface Movie {
  id: ID;
}

/**
 * A factory function that creates Movie
 */
export function createMovie(params: Partial<Movie>) {
  return {

  } as Movie;
}
