import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieBudgetForm } from '../../budget/budget.form';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { FormList } from '@blockframes/utils';
import { MovieReview } from '@blockframes/movie/movie+state/movie.model';

@Component({
  selector: '[budget] [salesInfo] [movieReview] movie-summary-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryBudgetComponent {
  @Input() budget: MovieBudgetForm;
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() movieReview: FormList<MovieReview>;
}
