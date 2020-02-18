import { FormControl } from '@angular/forms';
import { MovieReview } from '../../+state/movie.firestore';
import { createMovieReview } from '../../+state/movie.model';
import { FormEntity } from '@blockframes/utils';

function createMovieReviewControl(review: Partial<MovieReview> = {}) {
  const { criticName, journalName, criticQuote, revueLink } = createMovieReview(review);
  return {
    criticName: new FormControl(criticName),
    journalName: new FormControl(journalName),
    criticQuote: new FormControl(criticQuote),
    revueLink: new FormControl(revueLink),
  }
}

export type MovieReviewControls = ReturnType<typeof createMovieReviewControl>;

export class MovieReviewForm extends FormEntity<MovieReviewControls, MovieReview> {
  constructor(review?: Partial<MovieReview>) {
    super(createMovieReviewControl(review));
  }
}
