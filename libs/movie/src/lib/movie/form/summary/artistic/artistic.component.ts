import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss']
})
export class SummaryArtisticComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
