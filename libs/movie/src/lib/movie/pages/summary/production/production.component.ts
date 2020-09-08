import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss']
})
export class SummaryProductionComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
