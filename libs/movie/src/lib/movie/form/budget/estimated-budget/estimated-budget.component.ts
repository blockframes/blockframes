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
    { from: 0, to: 1000000 },
    { from: 1000000, to: 2000000 },
    { from: 2000000, to: 3000000 },
  ];
}
