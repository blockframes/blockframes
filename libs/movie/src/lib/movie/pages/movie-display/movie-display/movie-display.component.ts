import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie } from '../../../+state';
import { getLabelBySlug } from '../../../staticModels';
import { FlatMovie } from '../../../components/movie-form/movie.form';

@Component({
  selector: 'movie-display',
  templateUrl: './movie-display.component.html',
  styleUrls: ['./movie-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayComponent {
  public movie : Movie;
  public movieSections : any;

  @Input() set data(data: Movie | FlatMovie) {
    this.movie = this.fromFlatMovie(data);
  }

  constructor() { }

  /* Returns label from json staticModels */
  public getStaticBySlug (scope: string, slug: string) {
    return getLabelBySlug (scope, slug) as string;
  }

  // @todo WIP
  private fromFlatMovie(data) {
    const movie = { ... data };

    if(!movie.title){
      movie.title = {};
      if (movie.originalTitle) {
        movie.title.original = movie.originalTitle;
      }
  
      if (movie.internationalTitle) {
        movie.title.international = movie.internationalTitle;
      }
      delete movie.originalTitle;
      delete movie.internationalTitle;
    }

    return movie as Movie;
  }
}
