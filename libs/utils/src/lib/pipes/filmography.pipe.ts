import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/utils/common-interfaces/identity';

@Pipe({
  name: 'filmography'
})
export class FilmographyPipe implements PipeTransform {
  transform(value: Filmography[]): string {
    return value.map(({ title, year }) => `${title} (${year})`).join(', ');
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
