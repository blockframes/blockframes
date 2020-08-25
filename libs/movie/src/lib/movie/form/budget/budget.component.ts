// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes  Utils
import { BUDGET_LIST } from './budget.form';
import { MovieForm } from '../movie.form';

@Component({
  selector: 'movie-form-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetComponent {
  @Input() form: MovieForm;
  @Input() placeholder?: String;

  optionsBudget = BUDGET_LIST;
}
