import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { MovieForm, MovieReviewForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class SummaryReviewComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

  public reviewHasNoValue(review: MovieReviewForm) {
    return !review.get('criticName').value || !review.get('journalName').value || !review.get('criticQuote').value;
  }
}
