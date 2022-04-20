// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes  Utils
import { budgetRange } from '@blockframes/model';

@Component({
  selector: '[form]movie-form-budget-range',
  templateUrl: './budget-range.component.html',
  styleUrls: ['./budget-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetRangeComponent {
  @Input() form: FormControl;
  @Input() placeholder?: string;
  @Input() appearance = 'outline'

  /* Need to transform it into an array otherwise the order is messed up for the values */
  optionsBudget = Object.keys(budgetRange);
}
