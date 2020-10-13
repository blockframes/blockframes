import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] financiers-movie-summary-financial-details',
  templateUrl: './financial-details.component.html',
  styleUrls: ['./financial-details.component.scss']
})
export class SummaryFinancialDetailsComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  get totalBudget() {
    return this.movie.get('totalBudget');
  }
}
