import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MovieStore, MovieState } from './movie.store';
import { Movie } from './movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieQuery extends QueryEntity<MovieState, Movie> {
  // @todo #643 call it "form" instead of "akitaForm" as we're already looking into the state.
  movieFormChanges$ = this.select(state => state.akitaForm as Movie);

  constructor(protected store: MovieStore) {
    super(store);
  }


  /**
   * @param internalRef
   */
  public existingMovie(internalRef: string) : Movie {
    return this.getAll().find(entity =>  entity.main.internalRef === internalRef );
  }

}
