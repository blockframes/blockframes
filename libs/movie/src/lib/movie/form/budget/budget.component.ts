import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  get estimatedBudget() {
    return this.form.get('estimatedBudget');
  }

  get certifications() {
    return this.form.get('certifications');
  }

  get rating() {
    return this.form.get('rating');
  }

  get boxOffice() {
    return this.form.get('boxOffice');
  }

  get review() {
    return this.form.get('review');
  }
}
