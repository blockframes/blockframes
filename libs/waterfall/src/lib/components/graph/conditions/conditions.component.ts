
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Condition } from '@blockframes/model';
import { RightForm } from '../../forms/right-form/right-form';
import { createConditionForm, formToCondition, setConditionForm } from '../../forms/conditions-form/condition.form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'waterfall-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class WaterfallConditionsComponent implements OnInit, OnDestroy {

  @Input() public rightForm: RightForm;
  @Input() public rightId: string;
  @Input() @boolean public canUpdate = true;

  @Output() createStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();

  public selectedStep = 0;
  public newCondition: Condition | undefined = undefined;
  public conditionForm = createConditionForm();

  private subs: Subscription[] = [];
  ngOnInit() {
    this.conditionForm.enable();
    if (!this.canUpdate) this.conditionForm.disable();
    const formSub = this.conditionForm.valueChanges.subscribe(() => {
      const condition = formToCondition(this.conditionForm);
      if (condition) this.newCondition = condition;
    });

    const nameSub = this.rightForm.get('name').valueChanges.subscribe(name => {
      this.rightForm.get('name').setValue(name, { emitEvent: false });
    });

    const typeSub = this.rightForm.get('type').valueChanges.subscribe(type => {
      this.rightForm.get('type').setValue(type, { emitEvent: false });
    });

    this.subs.push(formSub, nameSub, typeSub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
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
