import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent {
  @Input() movie: Movie;
  @Input() movieLink: string;
}
