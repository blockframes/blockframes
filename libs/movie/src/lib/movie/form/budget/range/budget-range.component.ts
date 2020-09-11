// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes  Utils
import { BUDGET_LIST } from './budget-range.form';

@Component({
  selector: '[form]movie-form-budget-range',
  templateUrl: './budget-range.component.html',
  styleUrls: ['./budget-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetRangeComponent {
  @Input() form: FormControl;
  @Input() placeholder?: String;
  @Input() appearance = 'outline'

  optionsBudget = BUDGET_LIST;
}
