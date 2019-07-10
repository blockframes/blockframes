import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MovieStore, MovieState } from './movie.store';
import { Movie } from './movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieQuery extends QueryEntity<MovieState, Movie> {
  movieFormChanges$ = this.select(state => state.akitaForm);

  constructor(protected store: MovieStore) {
    super(store);
  }


  /**
   * @dev this method will be changed since we now have an internal movie reference 
   * Checks if a movie with given title, productionYear and directorName alreadyExists
   * @param originalTitle 
   * @param productionYear 
   * @param directorName 
   */
  public movieExists(originalTitle : string, productionYear : number, directorName : string) : string {
  
    const movie = this.getAll().find(entity => 
      entity.title.original === originalTitle &&
      entity.productionYear === productionYear &&
      entity.directorName === directorName
    );

    return movie !== undefined ? movie.id : undefined;
  }

}
