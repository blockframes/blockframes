import { Component, Input, ChangeDetectionStrategy, Directive, ViewEncapsulation } from '@angular/core';
import { Movie, Credit } from '../../+state';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { workType as WorkType } from '../../+state/movie.firestore';
import { ImgRef } from '@blockframes/utils/image-uploader';

const promotionalElements = [
  { key: 'promo_reel_link', label: 'Watch Promo Reel Link', type: 'play' },
  { key: 'teaser_link', label: 'Watch Pitch Teaser', type: 'play' },
  { key: 'screener_link', label: 'Watch Screener', type: 'play' },
  { key: 'trailer_link', label: 'Watch Trailer', type: 'play' },
  { key: 'scenario', label: 'Downlaod Scenario', type: 'download' },
  { key: 'presentation_deck', label: 'Download Presentation Deck', type: 'download' },
];

interface MovieView {
  title: string;
  subtitle: string;
  originTitle: string;
  directors: Credit[];
  countries: string[];
  poster: ImgRef;
  banner: ImgRef,
  links: { key: string, label: string, type: string, url: string }[];
}

function createMovieView(movie: Partial<Movie>): MovieView {
  const { workType, totalRunTime, genres, originalLanguages, productionYear } = movie.main;
  const subtitle = [
    workType ? WorkType[workType] : '',
    totalRunTime ? `${totalRunTime} min` : '',
    genres.map(genre => getLabelBySlug('GENRES', genre)).join(', '),
    originalLanguages.map(language => getLabelBySlug('LANGUAGES', language)).join(', '),
    productionYear
  ].filter(v => !!v).join(' | ');

  const links = promotionalElements
    .filter(({ key }) => movie.promotionalElements[key]?.media.url)
    .map(el => ({ ...el, url: movie.promotionalElements[el.key].media.url}))

  return {
    title: movie.main.title.international,
    subtitle,
    originTitle: movie.main.title.original,
    directors: movie.main.directors,
    countries: movie.main.originCountries,
    poster: movie.promotionalElements.poster[0]?.media,
    banner: movie.promotionalElements.banner.media,
    links
  }
}

@Component({
  selector: '[movie] movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {
  view: MovieView;

  @Input() navLinks: { path: string, label: string }[];
  @Input() set movie(movie: Movie) {
    if (movie) {
      this.view = createMovieView(movie);
    }
  }

}


@Directive({
  selector: 'movie-banner-actions, [movieBannerActions]',
  host: { class: 'movie-banner-actions' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieBannerActions {}

@Directive({
  selector: 'movie-banner-aside, [movieBannerAside]',
  host: { class: 'movie-banner-aside' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieBannerAside {}
