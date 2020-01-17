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
    { from: 0, to: 1000000, label: 'Less than 1 million' },
    { from: 1000000, to: 5000000, label: '1 - 5 millions' },
    { from: 5000000, to: 10000000, label: '5 - 10 millions' },
    { from: 10000000, to: 50000000, label: '10 - 50 millions' },
    { from: 50000000, to: 100000000, label: '50 - 100 millions' },
    { from: 100000000, to: 300000000, label: '100 - 300 millions' },
    { from: 300000000, to: 999999999, label: 'More than 300 millions' },
  ];
}
