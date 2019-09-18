import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MovieStore, MovieState } from './movie.store';
import { Movie, MovieSale } from './movie.model';

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

  /**
   * Checks if a sale is already existing for a given movie and returns it.
   * We use internalRef (ie: film code) to retreive movie since this ID is the one used in 
   * spreadsheets files.
   * @param internalRef 
   * @param sale 
   */
  public existingSale(internalRef: string, sale: MovieSale): MovieSale {
    try {
      const movie = this.existingMovie(internalRef);

      return movie.sales.find(entity =>
        entity.operatorName === sale.operatorName &&
        entity.showOperatorName === sale.showOperatorName &&
        new Date(entity.rights.from).getTime() === sale.rights.from.getTime() &&
        new Date(entity.rights.to).getTime() === sale.rights.to.getTime() &&
        entity.exclusive === sale.exclusive &&
        entity.price === sale.price &&
        entity.medias.length === sale.medias.length && entity.medias.slice().sort().every((value, index) => value === sale.medias.sort()[index]) &&
        entity.dubbings.length === sale.dubbings.length && entity.dubbings.slice().sort().every((value, index) => value === sale.dubbings.sort()[index]) &&
        entity.subtitles.length === sale.subtitles.length && entity.subtitles.slice().sort().every((value, index) => value === sale.subtitles.sort()[index]) &&
        entity.territories.length === sale.territories.length && entity.territories.slice().sort().every((value, index) => value === sale.territories.sort()[index])
      );
    } catch (e) {
      console.error(e.message);
    }
  }

}