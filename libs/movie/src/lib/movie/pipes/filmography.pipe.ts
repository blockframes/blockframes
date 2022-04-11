import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/model';

@Pipe({ name: 'filmography' })
export class FilmographyPipe implements PipeTransform {
  transform(filmography?: Filmography | Filmography[]) {
    const filmographyArray = !Array.isArray(filmography) ? [filmography] : filmography;
    if (filmographyArray.length) {
      return filmographyArray
        .map(film => {
          if (film?.title) {
            return film.year ? `${film.title} (${film.year})` : film.title;
          }
        })
        .filter(Boolean)
        .join(', ');
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
