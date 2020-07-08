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
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { getAssetPath, getImageUrl } from '@blockframes/media/+state/media.model';
import { Location } from '@angular/common';

function createMovieView(movie: Movie) {
  return {
    directors: movie.main.directors,
    title: {
      original: movie.main.title.original,
      international: movie.main.title.international
    },
    banner: movie.main.banner,
    poster: movie.main.poster,
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

  constructor(private sanitazier: DomSanitizer, private location: Location) { }

  @HostBinding('style.backgroundImage') background: SafeStyle;
  @Input('movie')
  set movieInput(movie: Movie) {
    if (movie) {
      this.movie = movie;
      this.movieView = createMovieView(movie);
      //TODO#2655: implement image-set directive to handle image size here
      const url = getImageUrl(this.movieView.banner.media) || getAssetPath('empty_banner.webp', 'dark');
      this.background = this.sanitazier.bypassSecurityTrustStyle(`url(${url})`);
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
