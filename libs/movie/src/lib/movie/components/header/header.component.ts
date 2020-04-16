// Angular
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Directive,
  HostBinding
} from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title, PromotionalElement, } from '@blockframes/movie/+state/movie.firestore';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { getISO3166TerritoryFromSlug } from '@blockframes/utils/static-model/territories-ISO-3166';

interface MovieHeaderView {
  directors: Credit[],
  title: Title,
  banner: PromotionalElement,
  poster: PromotionalElement[],
  titleFeatures: Array<string[] | string>
}

function createMovieView(movie: Movie): MovieHeaderView {
  const convertedGenres = movie.main.genres.map(genre => getLabelBySlug('GENRES', genre))
  const convertedOriginalLanguages = movie.main.originalLanguages.map(language => getLabelBySlug('LANGUAGES', language))
  const convertedOriginCountries = movie.main.originCountries.map(country => getISO3166TerritoryFromSlug(country)).map(country => country.iso_a2);
  const statusLabel = getLabelBySlug('MOVIE_STATUS', movie.main.status)
  return {
    directors: movie.main.directors,
    title: {
      original: movie.main.title.original,
      international: movie.main.title.international
    },
    banner: movie.promotionalElements.banner,
    poster: movie.promotionalElements.poster,
    titleFeatures: [
      // It matters in which order we input the value in this array
      movie.main.workType,
      convertedGenres,
      convertedOriginalLanguages,
      convertedOriginCountries,
      statusLabel
    ]
  }
}

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  public movieView: MovieHeaderView;

  @HostBinding('style.backgroundImage') background: string;
  @HostBinding('style.backgroundSize') size: string;
  @Input()
  set movie(movie: Movie) {
    if (movie) {
      this.movieView = createMovieView(movie);
      this.background = `url(${this.movieView.banner.media.url})`;
      this.size = 'cover';
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