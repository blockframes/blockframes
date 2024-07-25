
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RightForm } from '../../../../form/right.form';
import { ConditionForm, setConditionForm } from '../../../../form/condition.form';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'waterfall-conditions-read-only',
  templateUrl: './read-only.component.html',
  styleUrls: ['./read-only.component.scss'],
})
export class WaterfallConditionsReadOnlyComponent implements OnInit, OnDestroy {

  @Input() public rightForm: RightForm;
  @Input() public set rightId(id: string) {
    this.conditionForm.reset();
    this.conditionForm.disable();
    this.selectedStep$.next(0);
    this._rightId = id;
  }
  public get rightId() { return this._rightId; }
  public canUpdate = false;
  public selectedStep$ = new BehaviorSubject<number>(0);
  public conditionForm = new ConditionForm();

  private _rightId: string;

  private sub: Subscription;

  ngOnInit() {
    this.sub = this.selectedStep$.subscribe(() => this.conditionForm.reset());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  displayCondition(index: number) {
    const steps = this.rightForm.controls.steps.value;
    const condition = steps[this.selectedStep$.value][index];
    this.rightForm.controls.steps.setValue(steps);
    setConditionForm(this.conditionForm, condition);
  }

  selectStep(step: number) {
    this.selectedStep$.next(step);
  }

}
