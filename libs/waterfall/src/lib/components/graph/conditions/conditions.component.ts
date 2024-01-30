
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Condition } from '@blockframes/model';

import { RightForm } from '../../forms/right-form/right-form';
import { createConditionForm, formToCondition, setConditionForm } from '../../forms/conditions-form/condition.form';

@Component({
  selector: 'waterfall-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class WaterfallConditionsComponent implements OnInit {

  @Input() rightForm: RightForm;
  @Input() rightId: string;

  @Output() createStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();

  selectedStep = 0;

  newCondition: Condition | undefined = undefined;

  conditionForm = createConditionForm();

  ngOnInit() {
    this.conditionForm.valueChanges.subscribe(() => {
      const condition = formToCondition(this.conditionForm);
      if (condition) this.newCondition = condition;
    });
  }

  createCondition() {
    if (!this.newCondition) return;

    const steps = this.rightForm.controls.steps.value;
    steps[this.selectedStep].push(this.newCondition);
    this.rightForm.controls.steps.setValue(steps);
    this.conditionForm.reset();
  }

  editCondition(index: number) {
    const steps = this.rightForm.controls.steps.value;
    const [condition] = steps[this.selectedStep].splice(index, 1);
    this.rightForm.controls.steps.setValue(steps);
    setConditionForm(this.conditionForm, condition);
  }

  deleteCondition(index: number) {
    const steps = this.rightForm.controls.steps.value;
    steps[this.selectedStep].splice(index, 1);
    this.rightForm.controls.steps.setValue(steps);
  }

  selectStep(index: number) {
    this.selectedStep = index;
  }

  removeStep(index: number) {
    this.deleteStep.emit(index);
  }
}
