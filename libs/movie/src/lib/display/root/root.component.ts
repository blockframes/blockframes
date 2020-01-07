import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie } from '../../+state';

@Component({
  selector: '[movie] movie-display-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayComponent {

  @Input() movie: Movie;
  constructor() { }
}
