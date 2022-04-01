import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieReview } from '@blockframes/shared/model';

function createMovieReviewView(review: Partial<MovieReview>) {
  return {
    journalName: review.journalName || "Journale name couldn't be loaded",
    criticQuote: review.criticQuote || "Quote couldn't be loaded",
    link: review.revueLink,
    criticName: review.criticName || 'Unknow author',
    publicationDate: review.publicationDate || '',
  };
}

type MovieReviewView = ReturnType<typeof createMovieReviewView>;

@Component({
  selector: '[review] review-card',
  templateUrl: 'review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  public movieReview: MovieReviewView;
  @Input()
  set review(review: MovieReview) {
    this.movieReview = createMovieReviewView(review);
  }
}
