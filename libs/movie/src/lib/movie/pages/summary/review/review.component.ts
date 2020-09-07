import { Component, Input } from '@angular/core';
import { MovieForm, MovieReviewForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class SummaryReviewComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  public reviewHasNoValue(review: MovieReviewForm) {
    return !review.get('criticName').value || !review.get('journalName').value || !review.get('criticQuote').value;
  }
}
