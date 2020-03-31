import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieBudgetForm } from '../../budget/budget.form';
import { MovieSalesInfoForm } from '../../sales-info/sales-info.form';
import { MovieReview } from '@blockframes/movie/+state/movie.model';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { MovieReviewForm } from '../../review/review.form';

@Component({
  selector: '[budget] [salesInfo] [movieReview] movie-summary-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryBudgetComponent implements OnInit {
  @Input() budget: MovieBudgetForm;
  @Input() salesInfo: MovieSalesInfoForm;
  @Input() movieReview: FormList<MovieReview>;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.budget.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.salesInfo.valueChanges.subscribe(_ => this.cdr.markForCheck());
    this.movieReview.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public reviewHasNoValue(review: MovieReviewForm) {
    return !review.get('criticName').value || !review.get('journalName').value || !review.get('criticQuote').value;
  }
}
