
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Condition } from '@blockframes/model';
import { RightForm } from '../../forms/right-form/right-form';
import { createConditionForm, formToCondition, setConditionForm } from '../../forms/conditions-form/condition.form';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'waterfall-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class WaterfallConditionsComponent implements OnInit {

  @Input() public rightForm: RightForm;
  @Input() public rightId: string;
  @Input() @boolean public canUpdate = true;

  @Output() createStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();

  public selectedStep = 0;
  public newCondition: Condition | undefined = undefined;
  public conditionForm = createConditionForm();

  ngOnInit() {
    this.conditionForm.enable();
    if(!this.canUpdate) this.conditionForm.disable();
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
