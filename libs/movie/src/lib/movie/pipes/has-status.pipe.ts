// Angular
import { Pipe, PipeTransform, NgModule } from '@angular/core';

// Movie
import { Movie } from '@blockframes/data-model';
import { MovieForm } from '../form/movie.form';

@Pipe({
  name: 'hasStatus'
})
export class HasStatusPipe implements PipeTransform {
  transform(movie: MovieForm | Movie, status: Movie['productionStatus'][]): boolean {
    if (movie instanceof MovieForm) {
      /* If the user skipped the question of the production status, we want to display all controls */
      if (movie.get('productionStatus').value === null) {
        return true
      }
      return status.includes(movie.get('productionStatus').value)
    } else {
      return status.includes(movie.productionStatus);
    }
  }
}

@NgModule({
  exports: [HasStatusPipe],
  declarations: [HasStatusPipe],
})
export class HasStatusModule { }
