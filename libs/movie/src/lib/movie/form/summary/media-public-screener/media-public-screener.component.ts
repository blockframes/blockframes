import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-public-screener',
  templateUrl: './media-public-screener.component.html',
  styleUrls: ['./media-public-screener.component.scss']
})
export class SummaryMediaPublicScreenerComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
