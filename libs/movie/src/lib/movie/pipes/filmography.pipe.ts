import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/model';

export const displayFilmographies = (filmographies: Filmography[]) => {
  return filmographies
    .map(filmographiy => {
      if (filmographiy?.title) {
        return filmographiy.year ? `${filmographiy.title} (${filmographiy.year})` : filmographiy.title;
      }
    })
    .filter(f => !!f);
}

@Pipe({ name: 'filmography' })
export class FilmographyPipe implements PipeTransform {
  transform(filmography?: Filmography | Filmography[]) {
    const filmographies = !Array.isArray(filmography) ? [filmography] : filmography;
    return displayFilmographies(filmographies).join(', ');
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
