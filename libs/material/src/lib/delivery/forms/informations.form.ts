import { FormGroup, FormControl } from '@angular/forms';
import { FormList } from '@blockframes/utils';
import { Step } from '../+state';

export function createStepFormGroup(step: Step) {
  return new FormGroup({
    id: new FormControl(step.id),
    name: new FormControl(step.name),
    date: new FormControl(step.date)
  });
}

function createStepsFormList() {
  return FormList.factory([], createStepFormGroup);
}

function createDeliveryDatesFormGroup() {
  return new FormGroup({
    dueDate: new FormControl(),
    acceptationPeriod: new FormControl(),
    reWorkingPeriod: new FormControl()
  });
}

function createStepsFormList() {
  return FormList.factory([], createStepFormGroup);
}

export function createInformationsFormGroup() {
  return new FormGroup({
    deliveryDates: createDeliveryDatesFormGroup(),
    deliverySteps: createStepsFormList()
    // TODO: create formList for steps: issue#759
    // TODO: create formList for guaranteed minimum payment deadline: issue#764
  });
}
