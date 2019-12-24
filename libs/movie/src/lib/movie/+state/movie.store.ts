import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Movie } from './movie.model';

export interface MovieState extends EntityState<Movie>, ActiveState<string> {
  // @todo (#1463) form: Movie
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'movies', idKey: 'id' })
export class MovieStore extends EntityStore<MovieState> {

  constructor() {
    super();
  }

}

