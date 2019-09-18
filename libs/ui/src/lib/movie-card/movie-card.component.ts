import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent {
  @Input() movie: Movie;
  @Input() link: string;

  @Output() delete = new EventEmitter<Movie>();

  get posterSrc() {
    return this.movie.main.poster || '/assets/images/default-movie-poster.png';
  }

  public remove(movie: Movie) {
    this.delete.emit(movie);
  }
}
