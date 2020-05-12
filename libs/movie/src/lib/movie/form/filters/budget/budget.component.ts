import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: '[form] filter-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFilterComponent {

  @Input() form: FormControl; // FormControl of number

  formatLabel(value: number) {
    if (value >= 1000 && value < 1000000) {
      return Math.round(value / 1000) + 'k';
    } else if (value >= 1000000) {
      return (value / 1000000) + 'M';
    }

    return value;
  }

}
