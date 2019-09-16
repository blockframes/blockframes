import { CollectionState } from 'akita-ng-fire';
import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig } from '@datorama/akita';
import { Movie } from './movie.model';

export interface MovieState extends CollectionState<Movie> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'movies', idKey: 'id' })
export class MovieStore extends EntityStore<MovieState> {

  constructor() {
    super();
  }

}

