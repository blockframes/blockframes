import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { BUDGET_LIST } from '../budget.form';

@Component({
  selector: '[form] movie-form-estimated-budget',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetComponent {

  @Input() form: FormControl;

  public budgetList: NumberRange[] = BUDGET_LIST;
}
