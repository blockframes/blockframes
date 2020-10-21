// Angular
import { Component, ChangeDetectionStrategy, Input, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

// Blockframes  Utils
import { BUDGET_LIST } from './budget-range.form';

@Component({
  selector: '[form]movie-form-budget-range',
  templateUrl: './budget-range.component.html',
  styleUrls: ['./budget-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormBudgetRangeComponent implements AfterViewInit {
  @Input() form: FormControl;
  @Input() placeholder?: String;
  @Input() appearance = 'outline'

  optionsBudget = BUDGET_LIST;

  ngAfterViewInit() {
    /* Change detection will set the display value to the default one, meaning the text of the mat-label.
    The error appears when we reload the page, if we reload the page for instance on the main information and then
    navigate to the page where this component is used, this works without setTimeout */
    setTimeout(() => {
      if (this.form.value?.from) {
        this.optionsBudget.forEach(option => {
          if (option.label === this.form.value.label) {
            this.form.setValue(option)
          }
        })
      }
    }, 1000)
  }
}
