import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-sales-cast',
  templateUrl: './sales-cast.component.html',
  styleUrls: ['./sales-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummarySalesCastComponent {
  @Input() movie: MovieForm;
  @Input() link: string;
}
