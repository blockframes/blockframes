import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form] title-estimated-budget-filter',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetFilterComponent {

  @Input() form: FormControl; // FormControl of number

  public displayValue = 0;
}
