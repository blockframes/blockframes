import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-sales-pitch',
  templateUrl: './sales-pitch.component.html',
  styleUrls: ['./sales-pitch.component.scss']
})
export class SummarySalesPitchComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  get salesPitch() {
    return this.movie.get('promotional').get('salesPitch');
  }
}
