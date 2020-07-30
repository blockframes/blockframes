import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieReview } from '@blockframes/movie/+state/movie.model';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { MovieReviewForm } from '../../review/review.form';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] [review] movie-summary-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryBudgetComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() review: FormList<MovieReview>;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public reviewHasNoValue(review: MovieReviewForm) {
    return !review.get('criticName').value || !review.get('journalName').value || !review.get('criticQuote').value;
  }

  get boxOffice() {
    return this.movie.get('boxOffice');
  }

  get rating() {
    return this.movie.get('rating');
  }
}
