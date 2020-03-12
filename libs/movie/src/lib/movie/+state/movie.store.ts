import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Movie, createMovie } from './movie.model';
import { MovieAnalytics } from './movie.model';

export interface MovieState extends EntityState<Movie, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'movies', idKey: 'id' })
export class MovieStore extends EntityStore<MovieState> {
  analytics = new EntityStore<MovieState>(null, { name: 'movieAnalytics', idKey: 'movieId' });

  constructor() {
    super();
  }

  akitaPreAddEntity(movie: Partial<Movie>) {
    return createMovie(movie);
  }
}
