// Angular
import { Component, ChangeDetectionStrategy, Input, Directive, HostBinding } from '@angular/core';

// Blockframes
import { Movie, Credit } from '@blockframes/movie/+state';
import { Title } from '@blockframes/data-model';

interface MovieSliderView {
  directors: Credit[],
  titles: Title,
  synopsis: string
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
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieSlideCTA {
  @HostBinding('class') class = 'movie-slide-cta'
}

@Directive({
  selector: 'movie-slide-actions, [movieSlideActions]',
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class MovieSlideActions {
  @HostBinding('class') class = 'movie-slide-actions'
}
