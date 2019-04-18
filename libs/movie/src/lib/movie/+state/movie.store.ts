import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Movie } from './movie.model';

export interface MovieState extends EntityState<Movie>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'movies', idKey: 'id' })
export class MovieStore extends EntityStore<MovieState, Movie> {

  constructor() {
    super();
  }

}

