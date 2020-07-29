import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BUDGET_LIST } from '../budget.form';

@Component({
  selector: '[form] movie-form-estimated-budget',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetComponent {

  @Input() form: FormControl;

  public budgetList: string[] = BUDGET_LIST.map(budget => budget.label);

  // getLabel() {
  //   return this.form.value.label;
  // }

  // setForm(label: string) {
  //   const budget = BUDGET_LIST.find(b => b.label === label);
  //   this.form.setValue(budget);
  // }
}
