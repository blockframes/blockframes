import { Movie } from './../../+state/movie.model';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[movie] movie-display-card-item',
  templateUrl: './display-card-item.component.html',
  styleUrls: ['./display-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayCardItemComponent {
  @Input() movie: Movie;
  @Input() movieLink: string;
  @Input() productionYear: false;
}
