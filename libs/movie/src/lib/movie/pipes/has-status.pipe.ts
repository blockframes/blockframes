// Angular
import { Pipe, PipeTransform, NgModule } from '@angular/core';

// Movie
import { MovieForm } from '../form/movie.form';

@Pipe({
  name: 'hasStatus'
})
export class HasStatusPipe implements PipeTransform {
  transform(form: MovieForm, status: string[]): boolean {
    /* If the user skipped the question of the production status, we want to display all controls */
    if (form.get('productionStatus').value === null) {
      return true
    }
    return status.includes(form.get('productionStatus').value)
  }
}

@NgModule({
  exports: [HasStatusPipe],
  declarations: [HasStatusPipe],
})
export class HasStatusModule { }
