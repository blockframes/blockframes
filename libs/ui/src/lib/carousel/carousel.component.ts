import { Component, OnInit, Input } from '@angular/core';
import { Movie } from '@blockframes/movie/+state';

function createCarouselMovieView(movie: Movie) {
  return {
    banner: movie.promotionalElements?.banner.media,
    title: movie.main?.title.international,
    director: movie.main?.directors,
    titleFeature: movie
  }
}

type CarouselMovieView = ReturnType<typeof createCarouselMovieView>;

@Component({
  selector: '[movies] bf-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  public carouselMovies: CarouselMovieView[];
  @Input() set movies(movies: Movie[]) {
    this.carouselMovies = movies.map(movie => createCarouselMovieView(movie))
    console.log(this.carouselMovies)
  }

  constructor() { }

  ngOnInit() { }
}