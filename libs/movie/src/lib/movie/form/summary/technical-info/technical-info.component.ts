import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-technical-info',
  templateUrl: './technical-info.component.html',
  styleUrls: ['./technical-info.component.scss']
})
export class SummaryTechnicalInfoComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
