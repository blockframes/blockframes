import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieReview } from '@blockframes/movie/+state/movie.model';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { MovieForm, MovieReviewForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] [review] movie-summary-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryBudgetComponent {
  @Input() movie: MovieForm;
  @Input() review: FormList<MovieReview>;
  @Input() link: string;

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
