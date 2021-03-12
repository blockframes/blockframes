import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';

@Pipe({
  name: 'getTitle',
})
export class GetTitlePipe implements PipeTransform {

  constructor(
    private service: MovieService
  ) {}

  transform(titleId: string) {
    return this.service.valueChanges(titleId);
  }
}

@NgModule({
  declarations: [GetTitlePipe],
  exports: [GetTitlePipe]
})
export class GetTitlePipeModule { }
