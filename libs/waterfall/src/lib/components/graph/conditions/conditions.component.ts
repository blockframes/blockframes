
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Condition } from '@blockframes/model';
import { RightForm } from '../../../form/right.form';
import { ConditionForm, formToCondition, setConditionForm } from '../../../form/condition.form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'waterfall-conditions',
  templateUrl: './conditions.component.html',
  styleUrls: ['./conditions.component.scss'],
})
export class WaterfallConditionsComponent implements OnInit, OnDestroy {

  @Input() public rightForm: RightForm;
  @Input() @boolean public canUpdate = true;
  @Input() public set rightId(id: string) {
    this.conditionForm.reset();
    if (this.canUpdate) {
      this.conditionForm.enable();
    } else {
      this.conditionForm.disable();
    }
    this.newCondition = undefined;
    this.selectedStep$.next(0);
    const steps = this.rightForm.get('steps').value;
    this.index = steps[0]?.length || 0;
    this._rightId = id;
    this.showConditionForm$.next(steps[0].length > 0);
    this.lastStepEmpty$.next(steps[steps.length - 1].length === 0); // TODO #9896 not working well (when adding first cond and other cases), check
  }

  public get rightId() { return this._rightId; }
  public selectedStep$ = new BehaviorSubject<number>(0);
  public showConditionForm$ = new BehaviorSubject<boolean>(false);
  public lastStepEmpty$ = new BehaviorSubject<boolean>(false);
  public newCondition: Condition | undefined = undefined;
  public conditionForm = new ConditionForm();

  @Output() createStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();
  @Output() openModal = new EventEmitter<boolean>(false);
  @Output() validCondition = new EventEmitter<{ rightId: string, condition: Condition, step: number, index: number }>();
  @Output() conditionFormPristine = new EventEmitter<boolean>();

  private _rightId: string;
  private index = 0;
  private subs: Subscription[] = [];

  ngOnInit() {
    this.conditionForm.enable();
    if (!this.canUpdate) this.conditionForm.disable();
    const formSub = this.conditionForm.valueChanges.subscribe(() => {
      this.conditionFormPristine.emit(this.conditionForm.pristine);
      const condition = formToCondition(this.conditionForm);
      if (condition) { // ie: condition is valid
        this.newCondition = condition;
        this.validCondition.emit({ rightId: this.rightId, condition, step: this.selectedStep$.value, index: this.index });
      } else {
        this.newCondition = undefined;
      }
    });

    // TODO #9896 remove ?
    const nameSub = this.rightForm.get('name').valueChanges.subscribe(name => {
      this.rightForm.get('name').setValue(name, { emitEvent: false });
    });

    // TODO #9896 remove
    const typeSub = this.rightForm.get('type').valueChanges.subscribe(type => {
      this.rightForm.get('type').setValue(type, { emitEvent: false });
    });

    const stepSub = this.selectedStep$.subscribe(stepIndex => {
      this.conditionForm.reset();
      this.newCondition = undefined;
      const steps = this.rightForm.get('steps').value;
      this.index = steps[stepIndex]?.length || 0;
    });

    this.subs.push(formSub, nameSub, typeSub, stepSub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
  }

  addFirstStep() {
    this.showConditionForm$.next(true);
    this.openModal.emit(true);
  }

  addNewCondition(index: number) {
    if (!this.newCondition) return;
    this.index = index;
    this.conditionForm.reset();
  }

  editCondition(index: number) {
    this.index = index;
    const steps = this.rightForm.controls.steps.value;
    const condition = steps[this.selectedStep$.value][index];
    this.rightForm.controls.steps.setValue(steps);
    setConditionForm(this.conditionForm, condition);
  }

  deleteCondition(index: number) {
    const steps = this.rightForm.controls.steps.value;
    steps[this.selectedStep$.value].splice(index, 1);
    this.rightForm.controls.steps.setValue(steps);
    this.conditionForm.reset();
    this.conditionFormPristine.emit(false);
    this.newCondition = undefined;
    this.index = steps[this.selectedStep$.value].length;
  }

  selectStep(step: number) {
    this.selectedStep$.next(step);
  }

  addStep() {
    this.rightForm.controls.steps.value.push([]);
    this.createStep.emit();
  }

  removeStep(step: number) {
    this.rightForm.controls.steps.value.splice(step, 1);
    this.deleteStep.emit(step);
  }
}
