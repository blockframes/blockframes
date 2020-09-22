// Angular
import { Component, ChangeDetectionStrategy, Input, Directive } from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title } from '@blockframes/movie/+state/movie.firestore';

interface MovieSliderView {
  directors: Credit[],
  titles: Title,
  synopsis: string,
}

function createMovieSliderView(movie: Movie): MovieSliderView {
  return {
    directors: movie.directors || [],
    titles: {
      international: movie.title.international || '',
      original: movie.title.original || ''
    },
    synopsis: movie.synopsis || ''
  }
}

@Component({
  selector: '[movie] movie-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSlideComponent {
  title: Movie;
  movieView: MovieSliderView;
  @Input() set movie(movie: Movie) {
    this.movieView = createMovieSliderView(movie);
    this.title = movie;
  }
}

@Directive({
  selector: 'movie-slide-cta, [movieSlideCTA]',
  host: { class: 'movie-slide-cta' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieSlideCTA { }

@Directive({
  selector: 'movie-slide-actions, [movieSlideActions]',
  host: { class: 'movie-slide-actions' }
})
// tslint:disable-next-line: directive-class-suffix
export class MovieSlideActions { }
