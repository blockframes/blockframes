// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  HostBinding,
  ViewEncapsulation
} from '@angular/core';

// Blockframes
import { Movie } from '@blockframes/movie/+state';

function createMovieView(movie: Movie) {
  return {
    directors: movie.main.directors,
    title: {
      original: movie.main.title.original,
      international: movie.main.title.international
    },
    banner: movie.promotionalElements.banner,
    poster: movie.promotionalElements.poster[0]
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

  @HostBinding('style.backgroundImage') background: string;
  @Input('movie')
  set movieInput(movie: Movie) {
    if (movie) {
      this.movie = movie;
      this.movieView = createMovieView(movie);
      //TODO#2655: implement image-set directive to handle image size here
      this.background = `url(${this.movieView.banner.media.urls.original})`
    }
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
