import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NumberRange } from '@blockframes/utils/common-interfaces';

@Component({
  selector: '[form] movie-form-estimated-budget',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetComponent {

  @Input() form: FormControl;

  budgetList: NumberRange[] = [
    { from: 100000, to: 200000 },
    { from: 200000, to: 300000 },
  ];
}
