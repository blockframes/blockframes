import { Movie } from '../../+state/movie.model';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '[movie] movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCardComponent {
  @Input() movie: Movie;
  @Output() navigate = new EventEmitter<string>();
  @Input() displayProductionYear: false;

  public navigateTo(movieId: string) {
    this.navigate.emit(movieId);
  }

}
