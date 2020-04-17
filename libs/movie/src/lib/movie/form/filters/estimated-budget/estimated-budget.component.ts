import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { BUDGET_LIST } from '../../budget/budget.form';
import { FormList } from '@blockframes/utils/form';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: '[form] title-estimated-budget-filter',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetFilterComponent {

  @Input() form: FormList<NumberRange>;

  public budgetList= BUDGET_LIST;

  handleChange({checked, source}: MatCheckboxChange) {
    const label = source.value;
    const budget = this.budgetList.find(currentBudget => currentBudget.label === label);

    if (checked) { // ADD
      this.form.add(budget);
    } else { // REMOVE
      const index = this.form.controls.findIndex(control => (
        control.value?.label === budget.label &&
        control.value?.from === budget.from &&
        control.value?.to === budget.to
      ));
      this.form.removeAt(index);
    }
  }
}
