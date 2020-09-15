import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/utils/common-interfaces/identity';

@Pipe({
  name: 'filmography'
})
export class FilmographyPipe implements PipeTransform {
  transform(value: Filmography[]): string {
    return value.map((filmography, index) => {
      return index < value.length
        ? filmography.title.concat(`(${filmography.year.toString()})`)
        : filmography.title.concat(filmography.year.toString())
    }).join(', ');
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
