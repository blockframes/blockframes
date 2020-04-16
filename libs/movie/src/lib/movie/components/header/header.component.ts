// Angular
import {
  Component,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  Directive,
  ViewEncapsulation
} from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title, PromotionalElement, WorkType } from '@blockframes/movie/+state/movie.firestore';
import { MovieStatusLabel, LanguagesLabel } from '@blockframes/utils/static-model';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { getISO3166TerritoryFromSlug, EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';

interface MovieHeaderData {
  id: string,
  directors: Credit[],
  title: Title,
  workType: WorkType,
  runtime: string | number,
  genres: string[],
  tooltipGenres: string,
  countries: EnhancedISO3166Territory[],
  tooltipCountries: string,
  originalLanguages: LanguagesLabel[],
  tooltipOriginalLanguages: string,
  productionYear: number,
  productionStatus: MovieStatusLabel,
  banner: PromotionalElement,
  poster: PromotionalElement[],
}

function tailorMovieForHeader(movie: Movie): MovieHeaderData {
  const statusLabel = getLabelBySlug('MOVIE_STATUS', movie.main.status)
  const convertedGenres: string[] = movie.main.genres.map(genre => getLabelBySlug('GENRES', genre))
  const convertedOriginalLanguages = movie.main.originalLanguages.map(language => getLabelBySlug('LANGUAGES', language))
  const convertedOriginCountries = movie.main.originCountries.map(country => getISO3166TerritoryFromSlug(country));
  // Convert the values here for the tool tip, it saves a lot of resources
  // We convert the array to a string and replace the commas with whitespace
  const tooltipGenres = convertedGenres.splice(1, convertedGenres.length - 1).toString().replace(/[, ]/g, ' ');
  const tooltipCountries = convertedOriginCountries.splice(1, convertedOriginCountries.length - 1)
    .map(country => country.iso_a2.toString()).toString().replace(/[, ]/g, ' ');
  const tooltipOriginalLanguages = convertedOriginalLanguages.splice(1, convertedOriginalLanguages.length - 1).toString().replace(/[, ]/g, ' ');
  return {
    id: movie.id,
    directors: movie.main.directors,
    title: {
      original: movie.main.title.original,
      international: movie.main.title.international
    },
    workType: movie.main.workType,
    runtime: movie.main.totalRunTime,
    genres: convertedGenres,
    tooltipGenres: tooltipGenres,
    countries: convertedOriginCountries,
    tooltipCountries: tooltipCountries,
    originalLanguages: convertedOriginalLanguages,
    tooltipOriginalLanguages: tooltipOriginalLanguages,
    productionYear: movie.main.productionYear,
    productionStatus: statusLabel,
    banner: movie.promotionalElements.banner,
    poster: movie.promotionalElements.poster,
  }
}

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class HeaderComponent implements AfterViewInit {

  public tailoredMovie: MovieHeaderData;

  @Input()
  set movie(movie: Movie) {
    this.tailoredMovie = tailorMovieForHeader(movie);
  };

  @ViewChild('banner') banner: ElementRef<HTMLHeadingElement>
  @ViewChild('overlay') overlay: ElementRef<HTMLHeadingElement>

  ngAfterViewInit() {
    // We need two layers here otherwise we override ourselves
    this.overlay.nativeElement.style.background = 'linear-gradient(to right, black, transparent)';
    this.banner.nativeElement.style.backgroundImage = `url(${this.tailoredMovie.banner.media.url})`;
  }
}

@Directive({
  selector: 'movie-header-actions, [movieHeaderActions]',
  host: { class: 'movie-header-actions' }
})
export class MovieHeaderActions { }

@Directive({
  selector: 'movie-header-button, [movieHeaderButton]',
  host: { class: 'movie-header-button' }
})
export class MovieHeaderButton { }

@Directive({
  selector: 'movie-header-preferences, [movieHeaderPreferences]',
  host: { class: 'movie-header-preferences' }
})
export class MovieHeaderPreferences { }