import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Filmography } from '@blockframes/model';

@Pipe({ name: 'filmographyJoin' })
export class FilmographyJoinPipe implements PipeTransform {
  transform(filmography?: Filmography[]) {
    if (filmography.length) {
      return filmography
        .map(film => {
          if (film?.title) {
            return film.year ? `${film.title} (${film.year})` : film.title;
          }
        })
        .join(', ');
    }
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyJoinPipe],
  declarations: [FilmographyJoinPipe],
  providers: [],
})
export class FilmographyJoinPipeModule { }
