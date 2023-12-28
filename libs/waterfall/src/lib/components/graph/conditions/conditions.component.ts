
import { Component, Input, OnInit } from '@angular/core';

import { Condition } from '@blockframes/model';

import { RightForm } from '../../forms/right-form/right-form';
import { createConditionForm, formToCondition, setConditionForm } from './condition.form';


@Component({
  selector: 'waterfall-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class WaterfallConditionsComponent implements OnInit {

  @Input() rightForm: RightForm;

  newCondition: Condition | undefined = undefined;

  conditionForm = createConditionForm();

  ngOnInit() {
    this.conditionForm.valueChanges.subscribe(() => {
      const condition = formToCondition(this.conditionForm);
      console.log(condition);
      if (condition) this.newCondition = condition;
    });
  }

  updateNewCondition(condition?: Condition) {
    console.log(condition);
    this.newCondition = condition;
  }

  createCondition() {
    if (!this.newCondition) return;

    const conditions = this.rightForm.controls.conditions.value;
    conditions.push(this.newCondition);
    this.rightForm.controls.conditions.setValue(conditions);
    this.conditionForm = createConditionForm();
  }

  editCondition(index: number) {
    const conditions = this.rightForm.controls.conditions.value;
    const [condition] = conditions.splice(index, 1);
    this.rightForm.controls.conditions.setValue(conditions);
    setConditionForm(this.conditionForm, condition);
  }

  deleteCondition(index: number) {
    const conditions = this.rightForm.controls.conditions.value;
    conditions.splice(index, 1);
    this.rightForm.controls.conditions.setValue(conditions);
  }
}
