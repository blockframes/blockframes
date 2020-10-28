// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  ViewEncapsulation
} from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { Location } from '@angular/common';

function createMovieView(movie: Movie) {
  return {
    directors: movie.directors,
    title: {
      original: movie.title.original,
      international: movie.title.international
    },
    banner: movie.banner,
    poster: movie.poster,
  }
}

type MovieHeaderView = ReturnType<typeof createMovieView>

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  public movieView: MovieHeaderView;
  public movie: Movie;

  constructor(private location: Location) { }

  @Input('movie')
  set movieInput(movie: Movie) {
    if (movie) {
      this.movie = movie;
      this.movieView = createMovieView(movie);
    }
  }

  goBack() {
    this.location.back();
  }
}

@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]',
  host: { class: 'movie-header-actions' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeaderActions { }

@Directive({
  selector: 'movie-header-cta, [movieHeaderCTA]',
  host: { class: 'movie-header-cta' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeaderCTA { }

@Directive({
  selector: 'movie-header-preferences, [movieHeaderPreferences]',
  host: { class: 'movie-header-preferences' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieHeaderPreferences { }
