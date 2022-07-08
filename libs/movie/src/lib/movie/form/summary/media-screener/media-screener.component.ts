import { Component, Input } from '@angular/core';
import { MovieVideoForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[form][link] movie-summary-media-screener',
  templateUrl: './media-screener.component.html',
  styleUrls: ['./media-screener.component.scss']
})
export class SummaryMediaScreenerComponent {

  @Input() form: MovieVideoForm;
  @Input() link: string;

}
