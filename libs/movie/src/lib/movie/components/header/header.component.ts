// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { Location } from '@angular/common';

function createMovieView(movie: Movie) {
  return {
    id: movie.id,
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
  private _movie: Movie;

  constructor(private location: Location) { }

  @Input() showBackArrow = true;
  @Input() set movie(movie: Movie) {
    if (movie) {
      this._movie = movie;
      this.movieView = createMovieView(movie);
    }
  }

  get movie() { return this._movie }

  goBack() {
    this.location.back();
  }
}

@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderActions {
  @HostBinding('class') class = 'movie-header-actions'
}

@Directive({
  selector: 'movie-header-cta, [movieHeaderCTA]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderCTA {
  @HostBinding('class') class = 'movie-header-cta'
}

@Directive({
  selector: 'movie-header-preferences, [movieHeaderPreferences]'
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieHeaderPreferences {
  @HostBinding('class') class = 'movie-header-preferences'
}
