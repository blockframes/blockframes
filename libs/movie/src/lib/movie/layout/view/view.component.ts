import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Movie, Credit } from '../../+state';
import { ImgRef } from '@blockframes/utils';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { workType as WorkType } from '../../+state/movie.firestore';

const promotionalElements = [
  { key: 'promo_reel_link', label: '', icon: '' },
  { key: 'scenario', label: '', icon: '' },
  { key: 'screener_link', label: '', icon: '' },
  { key: 'teaser_link', label: 'Watch Pitch Teaser', icon: '' },
  { key: 'presentation_deck', label: 'Download Presentation Deck', icon: '' },
  { key: 'trailer_link', label: '', icon: '' },
];

interface MovieView {
  title: string;
  subtitle: string;
  originTitle: string;
  directors: Credit[];
  countries: string[];
  poster: ImgRef;
  links: { key: string, label: string, icon: string, url: string }[];
}

function createMovieView(movie: Partial<Movie> = {}): MovieView {
  const { workType, totalRunTime, genres, originalLanguages, productionYear } = movie.main;
  const subtitle = [
    workType ? WorkType[workType] : '',
    totalRunTime ? `${totalRunTime} min` : '',
    genres.map(genre => getLabelBySlug('GENRES', genre)),
    originalLanguages.map(language => getLabelBySlug('LANGUAGES', language)),
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
    links
  }
}

@Component({
  selector: '[movie] movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
  view: MovieView;

  @Input() set movie(movie: Movie) {
    this.view = createMovieView(movie);
  }
  @Input() navLinks: { path: string, label: string }[];

  constructor() { }

  ngOnInit(): void {
  }

}
