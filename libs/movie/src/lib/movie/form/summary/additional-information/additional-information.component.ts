import { Component, Input } from '@angular/core';
import { MovieForm } from '../../../form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss']
})
export class SummaryAdditionalInformationComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  
  get goals() {
    return this.movie.get('audience')
  }
}
