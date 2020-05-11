import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: '[form] filter-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFilterComponent {

  @Input() form: FormControl; // FormControl of number

  public currentValue = '0';

  updateCurrentValue(input: MatSliderChange) {
    const value = input.value
    if (value >= 1000 && value < 1000000) {
      this.currentValue = Math.round(value / 1000) + 'k';
    } else if (value >= 1000000) {
      this.currentValue = (value / 1000000) + 'M';
    } else {
      this.currentValue = value.toString();
    }
  }

}
