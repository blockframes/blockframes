// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryEvaluationComponent {
  @Input() movie: MovieForm;
  @Input() link: string;
}
