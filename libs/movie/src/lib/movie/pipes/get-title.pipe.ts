import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieService } from '../+state/movie.service';
import { Movie } from '../+state/movie.model';
import { Observable } from 'rxjs';

@Pipe({ name: 'getTitle' })
export class GetTitlePipe implements PipeTransform {

  constructor(
    private service: MovieService
  ) { }

  transform(titleId: string): Observable<Movie>
  transform(titleId: string[]): Observable<Movie[]>
  transform(titleId: string | string[]) {
    // We need that for the compiler to be happy, else it doesn't understand params
    return Array.isArray(titleId)
      ? this.service.valueChanges(titleId)
      : this.service.valueChanges(titleId);
  }
}

@NgModule({
  declarations: [GetTitlePipe],
  exports: [GetTitlePipe]
})
export class GetTitlePipeModule { }
