import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-screener',
  templateUrl: './media-screener.component.html',
  styleUrls: ['./media-screener.component.scss']
})
export class SummaryMediaScreenerComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
