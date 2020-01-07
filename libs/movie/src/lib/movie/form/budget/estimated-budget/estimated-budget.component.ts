import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { NumberRange } from '@blockframes/utils/common-interfaces';

@Component({
  selector: '[formGroup] movie-form-estimated-budget, [formGroupName] movie-form-estimated-budget',
  templateUrl: './estimated-budget.component.html',
  styleUrls: ['./estimated-budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimatedBudgetComponent {

  budgetList: NumberRange[] = [
    { from: 100000, to: 200000 },
    { from: 200000, to: 300000 },
  ];

  constructor(private controlContainer: ControlContainer) { }

  get form() {
    return this.controlContainer.control
  }

}
