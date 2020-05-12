import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieReview } from '@blockframes/movie/+state';

function createMovieReviewView(review: Partial<MovieReview>) {
  return {
    journalName: review.journalName || 'Journale name couldn\'t be loaded',
    criticQuote: review.criticQuote || 'Quote couldn\'t be loaded',
    link: review.revueLink
    // Wait for TODO #2752 add author and date, and maybe img
  }
}

@Component({
  selector: '[review] review-card',
  templateUrl: 'review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ReviewCardComponent {
  public movieReview
  @Input()
  set review(review: MovieReview) {
    this.movieReview = createMovieReviewView(review);
  }
}