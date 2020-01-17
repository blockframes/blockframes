import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetComponent {

  constructor(private form: MovieForm) { }

  get estimatedBudget() {
    return this.form.get('budget').get('estimatedBudget');
  }

  get certifications() {
    return this.form.get('salesInfo').get('certifications');
  }

  get rating() {
    return this.form.get('salesInfo').get('rating');
  }

  get boxOffice() {
    return this.form.get('budget').get('boxOffice');
  }


}
