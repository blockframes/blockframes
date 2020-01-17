import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieControl } from '../movie.form';

@Component({
  selector: '[form] movie-form-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent {

  @Input() form: MovieControl['movieReview'];

}
