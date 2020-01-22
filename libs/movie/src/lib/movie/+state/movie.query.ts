import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MovieStore, MovieState } from './movie.store';
import { Movie } from './movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieQuery extends QueryEntity<MovieState, Movie> {
  movieFormChanges$ = this.select(state => state.akitaForm as Movie);

  constructor(protected store: MovieStore) {
    super(store);
  }
}
