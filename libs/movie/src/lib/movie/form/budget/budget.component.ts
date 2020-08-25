// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes  Utils
import { BUDGET_LIST } from './budget.form';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'movie-form-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetComponent {
  @Input() form: FormControl;
  @Input() placeholder?: String;

  optionsBudget = BUDGET_LIST;
}
