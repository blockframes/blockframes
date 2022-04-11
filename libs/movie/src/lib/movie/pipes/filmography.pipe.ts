import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/model';

export const displayFilmography = (filmography: Filmography[]) => {
  return filmography
    .map(film => {
      if (film?.title) {
        return film.year ? `${film.title} (${film.year})` : film.title;
      }
    })
    .filter(Boolean)
}

@Pipe({ name: 'filmography' })
export class FilmographyPipe implements PipeTransform {
  transform(filmography?: Filmography | Filmography[]) {
    const filmographyArray = !Array.isArray(filmography) ? [filmography] : filmography;
    if (filmographyArray.every(film => !film)) return "--";
    return displayFilmography(filmographyArray).join(', ')
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
