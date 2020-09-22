import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/utils/common-interfaces/identity';

@Pipe({ name: 'filmography' })
export class FilmographyPipe implements PipeTransform {
  transform(filmography?: Filmography) {
    if (filmography?.title) {
      return filmography.year ? `${filmography.title} (${filmography.year})` : filmography.title;
    } else {
      return '-'
    }
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
