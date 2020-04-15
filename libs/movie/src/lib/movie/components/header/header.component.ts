// Angular
import {
  Component,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild
} from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title, WorkTypeValue, workType, PromotionalElement } from '@blockframes/movie/+state/movie.firestore';
import { MovieStatusLabel, LanguagesLabel } from '@blockframes/utils/static-model';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { getISO3166TerritoryFromSlug, EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';

interface MovieHeaderData {
  id: string,
  directors: Credit[],
  title: Title,
  workType: WorkTypeValue,
  runtime: string | number,
  genres: string[],
  countries: EnhancedISO3166Territory[],
  originalLanguages: LanguagesLabel[],
  productionYear: number,
  productionStatus: MovieStatusLabel,
  banner: string,
  poster: PromotionalElement[]
}

function tailorMovieForHeader(movie: Movie): MovieHeaderData {
  const statusLabel = getLabelBySlug('MOVIE_STATUS', movie.main.status)
  const convertedGenres = movie.main.genres.map(genre => getLabelBySlug('GENRES', genre))
  const convertedOriginalLanguages = movie.main.originalLanguages.map(langauge => getLabelBySlug('LANGUAGES', langauge))
  const convertedOriginCountry = movie.main.originCountries.map(country => getISO3166TerritoryFromSlug(country));
  return {
    id: movie.id,
    directors: movie.main.directors,
    title: {
      original: movie.main.title.original,
      international: movie.main.title.international
    },
    workType: movie.main.workType as any,
    runtime: movie.main.totalRunTime,
    genres: convertedGenres,
    countries: convertedOriginCountry,
    originalLanguages: convertedOriginalLanguages,
    productionYear: movie.main.productionYear,
    productionStatus: statusLabel,
    banner: movie.promotionalElements.banner.media.url,
    poster: movie.promotionalElements.poster
  }
}

@Component({
  selector: '[movie] movie-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {

  public tailoredMovie: MovieHeaderData;

  @Input()
  set movie(movie: Movie) {
    this.tailoredMovie = tailorMovieForHeader(movie);
  };

  @ViewChild('header') header: ElementRef<HTMLHeadingElement>

  ngAfterViewInit() {
  /*   this.header.nativeElement.style.background = 'linear-gradient(from left, to right, black, transparent)'; */
    this.header.nativeElement.style.backgroundImage = `url(${this.tailoredMovie.banner}`;
    console.log(this.tailoredMovie)
  }

  getValueForTooltip(key: string) {
    // Removes first value because its already displayed and
    const tooltipValue = this.tailoredMovie[key];
    // replaces comma with whitespace for tool tip
    return key === 'countries'
      ? tooltipValue.splice(1, this.tailoredMovie[key].length - 1)
      : tooltipValue.splice(1, this.tailoredMovie[key].length - 1).toString().replace(/[, ]/g, ' ')
  }

}
