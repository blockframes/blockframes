// Angular
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes  Utils
import { BUDGET_LIST } from './budget-range.form';

@Component({
  selector: '[form]movie-form-budget-range',
  templateUrl: './budget-range.component.html',
  styleUrls: ['./budget-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetRangeComponent implements OnInit {
  @Input() form: FormControl;
  @Input() placeholder?: String;
  @Input() appearance = 'outline'

  optionsBudget = BUDGET_LIST;

  ngOnInit() {
    if (this.form.value?.from) {
      this.optionsBudget.forEach(option => {
        if (option.to === this.form.value?.to) {
          this.form.setValue(option)
        }
      })
    }
  }
}
