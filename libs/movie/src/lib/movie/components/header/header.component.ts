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
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title, PromotionalElement, } from '@blockframes/movie/+state/movie.firestore';

interface MovieHeaderView {
  directors: Credit[],
  title: Title,
  banner: PromotionalElement,
  poster: PromotionalElement
}

function createMovieView(movie: Movie): MovieHeaderView {
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

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  public movieView: MovieHeaderView;

  public titleFeatures: Movie;

  @HostBinding('style.backgroundImage') background: string;
  @Input()
  set movie(movie: Movie) {
    if (movie) {
      this.titleFeatures = movie;
      this.movieView = createMovieView(movie);
      this.background = `url(${this.movieView.banner.media.url})`
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